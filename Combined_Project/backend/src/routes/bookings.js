import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { createBooking, listBookings, updateStatus, getBookingStats } from '../controllers/bookings.controller.js';

const validateBooking = [
  body('worker_id').isInt(),
  body('service_id').isInt(),
  body('booking_date').notEmpty(),
  body('duration_hours').isInt(),
  body('total_price').isNumeric(),
];

const router = Router();

// Stats must be before /:id routes
router.get('/stats/summary', authenticate(['client', 'worker']), getBookingStats);

router.post('/', authenticate(['client']), validateBooking, createBooking);

router.get('/client', authenticate(['client']), listBookings);
router.get('/worker', authenticate(['worker']), listBookings);

router.patch('/:bookingId/status', authenticate(['worker']), updateStatus);

export default router;
