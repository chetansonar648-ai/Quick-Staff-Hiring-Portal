// import { Router } from 'express';
// import { body, validationResult } from 'express-validator';
// import { authenticate } from '../middleware/auth.js';
// import { query } from '../config/db.js';

// const router = Router();

// router.post(
//   '/',
//   authenticate(['client']),
//   [
//     body('worker_id').isInt(),
//     body('service_id').isInt(),
//     body('booking_date').notEmpty(),
//     body('duration_hours').isInt(),
//     body('total_price').isNumeric(),
//   ],
//   async (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//     const {
//       worker_id,
//       service_id,
//       booking_date,
//       duration_hours,
//       total_price,
//       address,
//       special_instructions,
//       payment_method,
//     } = req.body;

//     try {
//       const inserted = await query(
//         `INSERT INTO bookings
//          (client_id, worker_id, service_id, booking_date, duration_hours, total_price, address, special_instructions, payment_method)
//          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
//          RETURNING *`,
//         [
//           req.user.id,
//           worker_id,
//           service_id,
//           booking_date,
//           duration_hours,
//           total_price,
//           address || null,
//           special_instructions || null,
//           payment_method || null,
//         ]
//       );
//       res.status(201).json(inserted.rows[0]);
//     } catch (err) {
//       next(err);
//     }
//   }
// );

// router.get('/client', authenticate(['client']), async (req, res, next) => {
//   try {
//     const result = await query(
//       `SELECT * FROM bookings WHERE client_id=$1 ORDER BY created_at DESC`,
//       [req.user.id]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     next(err);
//   }
// });

// router.get('/worker', authenticate(['worker']), async (req, res, next) => {
//   try {
//     const result = await query(
//       `SELECT * FROM bookings WHERE worker_id=$1 ORDER BY created_at DESC`,
//       [req.user.id]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     next(err);
//   }
// });

// router.patch('/:id/status', authenticate(['worker']), async (req, res, next) => {
//   const { status } = req.body;
//   const allowed = ['accepted', 'rejected', 'in_progress', 'completed', 'cancelled'];
//   if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

//   try {
//     const result = await query(
//       `UPDATE bookings SET status=$1, updated_at=NOW()
//        WHERE id=$2 AND worker_id=$3
//        RETURNING *`,
//       [status, req.params.id, req.user.id]
//     );
//     if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
//     res.json(result.rows[0]);
//   } catch (err) {
//     next(err);
//   }
// });

// export default router;


import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { query } from '../config/db.js';

const router = Router();

router.post(
  '/',
  authenticate(['client']),
  [
    body('worker_id').isInt(),
    body('service_id').isInt(),
    body('booking_date').notEmpty(),
    body('duration_hours').isInt(),
    body('total_price').isNumeric(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      worker_id,
      service_id,
      booking_date,
      duration_hours,
      total_price,
      address,
      special_instructions,
      payment_method,
    } = req.body;

    try {
      const inserted = await query(
        `INSERT INTO bookings
         (client_id, worker_id, service_id, booking_date, duration_hours, total_price, address, special_instructions, payment_method)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [
          req.user.id,
          worker_id,
          service_id,
          booking_date,
          duration_hours,
          total_price,
          address || null,
          special_instructions || null,
          payment_method || null,
        ]
      );
      res.status(201).json(inserted.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/client', authenticate(['client']), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM bookings WHERE client_id=$1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/worker', authenticate(['worker']), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM bookings WHERE worker_id=$1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', authenticate(['worker']), async (req, res, next) => {
  const { status } = req.body;
  const allowed = ['accepted', 'rejected', 'in_progress', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  try {
    const result = await query(
      `UPDATE bookings SET status=$1, updated_at=NOW()
       WHERE id=$2 AND worker_id=$3
       RETURNING *`,
      [status, req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
