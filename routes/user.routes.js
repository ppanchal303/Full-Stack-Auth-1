import express from "express";
import {
  registerUser,
  verifyUser,
  userLogin,
  getProfile,
  userLogout,
  forgotPassword,
  resetPassword,
} from "../controller/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();

// These are all the routes which a user can access, and what happens at this routes is governed by controllers.
router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", userLogin);
router.get("/profile", isLoggedIn, getProfile);

export default router;
