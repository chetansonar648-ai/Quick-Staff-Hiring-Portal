// import { Router } from 'express'
// import { body, validationResult } from 'express-validator'
// import { authenticate } from '../middleware/auth.js'
// import { query } from '../config/db.js'

// const router = Router()

// router.get('/', async (req, res, next) => {
//   try {
//     const result = await query('SELECT * FROM services ORDER BY created_at DESC')
//     res.json(result.rows)
//   } catch (err) {
//     next(err)
//   }
// })

// router.post(
//   '/',
//   authenticate(['admin']),
//   [
//     body('name').notEmpty(),
//     body('category').notEmpty(),
//     body('base_price').isNumeric(),
//     body('duration_hours').optional().isInt()
//   ],
//   async (req, res, next) => {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
//     const { name, description, category, base_price, duration_hours, image_url } = req.body
//     try {
//       const inserted = await query(
//         `INSERT INTO services (name, description, category, base_price, duration_hours, image_url)
//          VALUES ($1,$2,$3,$4,$5,$6)
//          RETURNING *`,
//         [name, description || null, category, base_price, duration_hours || null, image_url || null]
//       )
//       res.status(201).json(inserted.rows[0])
//     } catch (err) {
//       next(err)
//     }
//   }
// )

// export default router
// import { Router } from "express";
// import { authenticate, authorize } from "../middleware/auth.js";
// import {
//   attachWorkerService,
//   createService,
//   listServices,
//   listWorkerServices,
//   validateService,
// } from "../controllers/servicesController.js";

// const router = Router();

// router.get("/", listServices);
// router.get("/worker/:workerId", listWorkerServices);
// router.post("/", authenticate, authorize("admin"), validateService, createService);
// router.post("/attach", authenticate, authorize("worker"), attachWorkerService);
// router.get("/me", authenticate, authorize("worker"), listWorkerServices);

// export default router;

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { query } from '../config/db.js';

const router = Router();

// Get service names for dropdown
router.get('/names', async (req, res, next) => {
  try {
    const result = await query('SELECT DISTINCT name FROM services ORDER BY name');
    res.json(result.rows.map(row => row.name));
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM services ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate(['admin']),
  [
    body('name').notEmpty(),
    body('category').notEmpty(),
    body('base_price').isNumeric(),
    body('duration_hours').optional().isInt(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description, category, base_price, duration_hours, image_url } = req.body;

    try {
      const inserted = await query(
        `INSERT INTO services (name, description, category, base_price, duration_hours, image_url)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING *`,
        [name, description || null, category, base_price, duration_hours || null, image_url || null]
      );
      res.status(201).json(inserted.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
