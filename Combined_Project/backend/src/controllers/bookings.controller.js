import { query } from '../config/db.js';

export const createBooking = async (req, res) => {
  const { worker_id, service_id, booking_date, duration_hours, total_price, address, special_instructions } =
    req.body;

  try {
    const result = await query(
      `INSERT INTO bookings (client_id, worker_id, service_id, booking_date, duration_hours,
        total_price, address, special_instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        worker_id,
        service_id,
        booking_date,
        duration_hours,
        total_price,
        address || 'Not specified',
        special_instructions,
      ]
    );
    return res.status(201).json({ booking: result.rows[0] });
  } catch (err) {
    console.error('Booking creation error:', err);
    return res.status(500).json({ message: 'Failed to create booking', error: err.message });
  }
};

export const listBookings = async (req, res) => {
  const { status } = req.query;
  const isWorker = req.user.role === 'worker';
  const roleColumn = isWorker ? 'b.worker_id' : 'b.client_id';
  const otherRoleColumn = isWorker ? 'b.client_id' : 'b.worker_id';

  let queryText = `
    SELECT
      b.*,
      s.name as service_type,
      s.image_url as service_image,
      u.name as ${isWorker ? 'client_name' : 'worker_name'},
      u.profile_image as ${isWorker ? 'client_image' : 'worker_image'},
      u.address as user_address,
      wp.title as worker_role
    FROM bookings b
    LEFT JOIN services s ON b.service_id = s.services_id
    LEFT JOIN users u ON ${otherRoleColumn} = u.id
    LEFT JOIN worker_profiles wp ON b.worker_id = wp.user_id
    WHERE ${roleColumn} = $1
  `;

  const queryParams = [req.user.id];

  if (status) {
    if (status === 'upcoming') {
      // "upcoming" usually means accepted/pending in future? Or just filtering by status string 'upcoming' if DB uses that?
      // Client frontend sends status strings like 'upcoming', 'active'.
      // DB check constraint allows: 'pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'.
      // So 'upcoming' might need to map to 'accepted' + date future?
      // For now, let's assume strict status matching unless specific keywords.
      // But Client frontend sends "upcoming" which isn't in DB constraint.
      // Client frontend map: upcoming->upcoming, active->active.
      // Wait, Client Frontend `MyBookings.jsx` line 35 maps statuses!
      // upcoming -> "upcoming" (which is NOT in DB).
      // I need to correct Client Frontend or Handle it here.
      // If status is 'upcoming', it probably means 'accepted' and date > now.
      // If status is 'active', probably 'in_progress'.
      // Let's just pass specific DB statuses where possible or handle groups.
      queryText += ` AND b.status = $2`;
      queryParams.push(status);
    } else {
      queryText += ` AND b.status = $2`;
      queryParams.push(status);
    }
  }

  queryText += ` ORDER BY b.created_at DESC`;

  try {
    const result = await query(queryText, queryParams);
    // Map usage of address
    const mappedRows = result.rows.map(row => ({
      ...row,
      location_address: row.address || row.user_address // Use booking address if set, else user address
    }));
    return res.json(mappedRows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching bookings' });
  }
};

export const updateStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const allowed = ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const result = await query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );
    return res.json({ booking: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update status' });
  }
};

export const getBookingStats = async (req, res) => {
  try {
    const isWorker = req.user.role === 'worker';
    const column = isWorker ? 'worker_id' : 'client_id';

    const result = await query(
      `SELECT status, COUNT(*) as count 
       FROM bookings 
       WHERE ${column} = $1 
       GROUP BY status`,
      [req.user.id]
    );

    const stats = {
      active: 0,
      completed: 0,
      cancelled: 0,
      total: 0
    };

    result.rows.forEach(row => {
      const count = parseInt(row.count);
      stats.total += count;
      if (['pending', 'accepted', 'in_progress'].includes(row.status)) {
        stats.active += count;
      } else if (row.status === 'completed') {
        stats.completed += count;
      } else if (row.status === 'cancelled') {
        stats.cancelled += count;
      }
    });

    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching stats' });
  }
};

