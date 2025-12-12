import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getProfile, updateProfile, validateUpdate } from "../controllers/usersController.js";

const router = Router();

router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, validateUpdate, updateProfile);

export default router;

