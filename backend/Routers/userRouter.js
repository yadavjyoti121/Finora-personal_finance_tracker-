import express from 'express';
import {
  forgotPasswordController,
  getCurrentUserController,
  loginControllers,
  logoutController,
  resetPasswordController,
  registerControllers,
  setAvatarController,
  updateProfileController,
  validateResetTokenController,
} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route("/register").post(registerControllers);

router.route("/login").post(loginControllers);

router.route("/forgot-password").post(forgotPasswordController);

router.route("/reset-password/:token").post(resetPasswordController);

router.route("/reset-password/:token/validate").get(validateResetTokenController);

router.route("/me").get(authMiddleware, getCurrentUserController);

router.route("/logout").post(authMiddleware, logoutController);

router.route("/setAvatar").post(authMiddleware, setAvatarController);

router.route("/profile").patch(authMiddleware, updateProfileController);

export default router;
