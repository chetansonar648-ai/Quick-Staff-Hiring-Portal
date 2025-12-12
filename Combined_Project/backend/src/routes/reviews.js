// import { Router } from 'express'
// import { body, validationResult } from 'express-validator'
// import { authenticate } from '../middleware/auth.js'
// import { query } from '../config/db.js'

// const router = Router()

// router.post(
//   '/',
//   authenticate(),
//   [body('booking_id').isInt(), body('reviewee_id').isInt(), body('rating').isInt({ min: 1, max: 5 })],
//   async (req, res, next) => {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
//     const { booking_id, reviewee_id, rating, comment } = req.body
//     try {
//       const inserted = await query(
//         `INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
//          VALUES ($1,$2,$3,$4,$5)
//          RETURNING *`,
//         [booking_id, req.user.id, reviewee_id, rating, comment || null]
//       )
//       res.status(201).json(inserted.rows[0])
//     } catch (err) {
//       next(err)
//     }
//   }
// )

// router.get('/me', authenticate(), async (req, res, next) => {
//   try {
//     const result = await query(
//       `SELECT * FROM reviews WHERE reviewee_id=$1 ORDER BY created_at DESC`,
//       [req.user.id]
//     )
//     res.json(result.rows)
//   } catch (err) {
//     next(err)
//   }
// })

// export default router
// import { Router } from "express";
// import { authenticate } from "../middleware/auth.js";
// import { createReview, listReviewsForUser, validateReview } from "../controllers/reviewsController.js";

// const router = Router();

// router.get("/:userId", listReviewsForUser);
// router.post("/", authenticate, validateReview, createReview);

// export default router;

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { query } from '../config/db.js';

const router = Router();

router.post(
  '/',
  authenticate(),
  [
    body('booking_id').isInt(),
    body('reviewee_id').isInt(),
    body('rating').isInt({ min: 1, max: 5 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { booking_id, reviewee_id, rating, comment } = req.body;

    try {
      const inserted = await query(
        `INSERT INTO reviews (booking_id, reviewer_id, reviewee_id, rating, comment)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [booking_id, req.user.id, reviewee_id, rating, comment || null]
      );
      res.status(201).json(inserted.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', authenticate(), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT * FROM reviews WHERE reviewee_id=$1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
