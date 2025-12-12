import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { uploadProfilePicture } from "../middleware/upload.js";
import { query } from "../config/db.js";
import {
  getWorkerProfile,
  listWorkers,
  updateWorkerProfile,
  validateWorkerProfile,
  getWorkerStats,
  getWorkerJobs,
  updateJobStatus,
  getSavedClients,
} from "../controllers/workersController.js";

const router = Router();

router.get("/", listWorkers);
router.get("/stats", authenticate(["worker"]), getWorkerStats);
router.get("/jobs", authenticate(["worker"]), getWorkerJobs);
router.patch("/jobs/:id/status", authenticate(["worker"]), updateJobStatus);
router.get("/saved-clients", authenticate(["worker"]), getSavedClients);

router.get("/:id", getWorkerProfile);
router.get("/me/profile", authenticate(), getWorkerProfile);
router.put("/me/profile", authenticate(["worker"]), validateWorkerProfile, updateWorkerProfile);

// Profile picture upload
router.post(
  "/me/profile-picture",
  authenticate(["worker"]),
  uploadProfilePicture.single("profile_picture"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      // Update worker_profiles table
      const existing = await query("SELECT id FROM worker_profiles WHERE user_id=$1", [req.user.id]);

      if (existing.rows[0]) {
        await query(
          "UPDATE worker_profiles SET profile_picture = $1, updated_at = NOW() WHERE user_id = $2",
          [imageUrl, req.user.id]
        );
      } else {
        await query(
          "INSERT INTO worker_profiles (user_id, profile_picture) VALUES ($1, $2)",
          [req.user.id, imageUrl]
        );
      }

      res.json({ profile_picture: imageUrl, message: "Profile picture updated successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
