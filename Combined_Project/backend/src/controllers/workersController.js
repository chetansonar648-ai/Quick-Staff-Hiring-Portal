import { body, validationResult } from "express-validator";
import { query } from "../config/db.js";

const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Time format regex: supports "09:00 AM", "05:00 PM", "09:00", "17:00"
const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(\s?(AM|PM))?$/i;

const validateAvailability = (availability) => {
  if (!availability || typeof availability !== 'object') {
    return true; // Optional field - allow null/undefined
  }

  for (const [day, times] of Object.entries(availability)) {
    // Check if day is valid
    if (!validDays.includes(day)) {
      throw new Error(`Invalid day: ${day}. Must be one of: ${validDays.join(', ')}`);
    }

    // Check if times object has start and end
    if (!times || typeof times !== 'object') {
      throw new Error(`Availability for ${day} must be an object with start and end times`);
    }

    const { start, end } = times;

    // Allow empty values (user can leave a day blank)
    if (!start && !end) continue;

    // If one is provided, both must be provided
    if ((start && !end) || (!start && end)) {
      throw new Error(`${day} must have both start and end times, or leave both empty`);
    }

    // Validate time format
    if (start && !timeRegex.test(start)) {
      throw new Error(`Invalid start time format for ${day}. Use HH:MM or HH:MM AM/PM`);
    }
    if (end && !timeRegex.test(end)) {
      throw new Error(`Invalid end time format for ${day}. Use HH:MM or HH:MM AM/PM`);
    }
  }

  return true;
};

export const validateWorkerProfile = [
  body("name").optional().isString().withMessage("Name must be a string"),
  body("phone").optional().isString().withMessage("Phone must be a string"),
  body("bio").optional().isString().withMessage("Bio must be a string"),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("hourly_rate").optional({ nullable: true, checkFalsy: true }).isDecimal().withMessage("Hourly rate must be a decimal number"),
  body("availability").optional().custom(validateAvailability),
  body("title").optional().isString().withMessage("Title must be a string"),
  body("years_of_experience").optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).withMessage("Years of experience must be a non-negative integer"),
  body("address").optional().isString().withMessage("Address must be a string"),
  body("service_location").optional().isString().withMessage("Service location must be a string"),
];

export const getWorkerProfile = async (req, res, next) => {
  const workerId = req.params.id || req.user.id;
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.profile_image,
              wp.bio, wp.skills, wp.hourly_rate, wp.availability, wp.rating, wp.total_reviews, wp.completed_jobs,
              wp.title, wp.years_of_experience, wp.address, wp.service_location, wp.profile_picture
       FROM users u
       LEFT JOIN worker_profiles wp ON wp.user_id = u.id
       WHERE u.id=$1`,
      [workerId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const updateWorkerProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, phone, bio, skills, hourly_rate, availability, title, years_of_experience, address, service_location } = req.body;
  try {
    // Update user name/phone if provided
    if (name || phone) {
      await query(
        `UPDATE users SET 
          name = COALESCE($1, name), 
          phone = COALESCE($2, phone), 
          updated_at = NOW() 
         WHERE id = $3`,
        [name || null, phone || null, req.user.id]
      );
    }

    // Check if profile exists
    const check = await query('SELECT id FROM worker_profiles WHERE user_id=$1', [req.user.id]);

    if (check.rows.length === 0) {
      // ID doesn't exist, INSERT
      const result = await query(
        `INSERT INTO worker_profiles 
           (user_id, bio, skills, hourly_rate, availability, title, years_of_experience, address, service_location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
        [req.user.id, bio, skills, hourly_rate, availability, title, years_of_experience, address, service_location]
      );
      return res.json(result.rows[0]);
    } else {
      // UPDATE
      const result = await query(
        `UPDATE worker_profiles
           SET bio = COALESCE($1, bio),
               skills = COALESCE($2, skills),
               hourly_rate = COALESCE($3, hourly_rate),
               availability = COALESCE($4, availability),
               title = COALESCE($5, title),
               years_of_experience = COALESCE($6, years_of_experience),
               address = COALESCE($7, address),
               service_location = COALESCE($8, service_location),
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id=$9
           RETURNING *`,
        [bio, skills, hourly_rate, availability, title, years_of_experience, address, service_location, req.user.id]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    next(err);
  }
};

export const getWorkerStats = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    // Get profile stats
    const profileRes = await query(
      `SELECT rating, completed_jobs FROM worker_profiles WHERE user_id = $1`,
      [workerId]
    );
    const profile = profileRes.rows[0] || { rating: 0, completed_jobs: 0 };

    // Get total earnings (sum of completed & paid jobs)
    const earningsRes = await query(
      `SELECT COALESCE(SUM(total_price), 0) as total_earnings 
       FROM bookings 
       WHERE worker_id = $1 AND status = 'completed'`, // simple check for now, ideally check payment_status='paid' too but strict rules say minimize assumptions. DB has payment_status default 'pending'.
      [workerId]
    );
    // Note: Assuming 'completed' job implies earning. If payment_status is robust, use it. 
    // DB default is pending. Let's stick to status='completed' for simplicity unless payment flow is fully built.

    // Get jobs this week (start of week calculation)
    // Simple count for now

    res.json({
      total_earnings: parseFloat(earningsRes.rows[0].total_earnings),
      completed_jobs: profile.completed_jobs,
      rating: parseFloat(profile.rating)
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkerJobs = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const { status } = req.query; // 'pending', 'active', 'history' (custom), or specific DB status

    let statusClause = '';
    const params = [workerId];

    if (status) {
      if (status === 'history') {
        statusClause = `AND (b.status = 'completed' OR b.status = 'rejected' OR b.status = 'cancelled')`;
      } else if (status === 'active') {
        statusClause = `AND (b.status = 'accepted' OR b.status = 'in_progress')`;
      } else {
        params.push(status);
        statusClause = `AND b.status = $2`;
      }
    }

    const queryStr = `
      SELECT b.*, 
             s.name as service_name, 
             u.name as client_name, u.profile_image as client_image
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.client_id = u.id
      WHERE b.worker_id = $1 ${statusClause}
      ORDER BY b.booking_date DESC
    `;

    const result = await query(queryStr, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

export const updateJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const workerId = req.user.id;

    // Optional: Add validation for valid transitions

    const result = await query(
      `UPDATE bookings 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND worker_id = $3 
       RETURNING *`,
      [status, id, workerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    // If status is completed, increment worker_profiles.completed_jobs
    if (status === 'completed') {
      await query(
        `UPDATE worker_profiles SET completed_jobs = completed_jobs + 1 WHERE user_id = $1`,
        [workerId]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const getSavedClients = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const result = await query(
      `SELECT sc.id, sc.client_id, u.name, u.email, u.phone, u.profile_image, u.address
       FROM saved_clients sc
       JOIN users u ON sc.client_id = u.id
       WHERE sc.worker_id = $1`,
      [workerId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

export const listWorkers = async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.profile_image, wp.skills, wp.hourly_rate, wp.rating, wp.total_reviews
       FROM users u
       JOIN worker_profiles wp ON wp.user_id = u.id
       WHERE u.role='worker' AND u.is_active = TRUE`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

