import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  normalizeEmail,
  PASSWORD_RULE,
  validateEmail,
  validatePassword,
  validateRequiredFields,
} from "../utils/authValidation.js";
import { sendResetPasswordEmail } from "../services/emailService.js";
import { saveBase64Image } from "../utils/fileUpload.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatarImage: user.avatarImage,
  isAvatarImageSet: user.isAvatarImageSet,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const buildAuthResponse = (user, message) => ({
  success: true,
  message,
  token: signToken(user),
  user: sanitizeUser(user),
});

export const registerControllers = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const missingFields = validateRequiredFields({ name, email, password });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: PASSWORD_RULE,
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json(buildAuthResponse(newUser, "Account created successfully."));
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const loginControllers = async (req, res) => {
  try {
    const { email, password } = req.body;
    const missingFields = validateRequiredFields({ email, password });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json(buildAuthResponse(user, `Welcome back, ${user.name}.`));
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!validateEmail(email || "")) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists for that email, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendBaseUrl}/reset-password/${resetToken}`;
    const emailResult = await sendResetPasswordEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return res.status(200).json({
      success: true,
      message: emailResult.delivered
        ? "Password reset link sent to your email."
        : "Password reset link generated. Configure SMTP to send email automatically.",
      previewUrl: emailResult.previewUrl,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!validatePassword(password || "")) {
      return res.status(400).json({
        success: false,
        message: PASSWORD_RULE,
      });
    }

    const hashedResetToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedResetToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const validateResetTokenController = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedResetToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedResetToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("_id email passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reset link is valid.",
      email: user.email,
      expiresAt: user.passwordResetExpires,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const setAvatarController = async (req, res, next) => {
  try {
    const imageData = req.body.image;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: "Please provide an image to upload.",
      });
    }

    const avatarPath = imageData.startsWith("data:")
      ? saveBase64Image({
          imageData,
          userId: req.user.id,
        })
      : imageData;

    const userData = await User.findByIdAndUpdate(
      req.user.id,
      {
        isAvatarImageSet: true,
        avatarImage: avatarPath,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      isSet: userData.isAvatarImageSet,
      image: avatarPath,
      user: sanitizeUser(userData),
      message: "Profile image updated successfully.",
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const { name, image } = req.body;
    const updates = {};

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    if (image) {
      updates.avatarImage = image.startsWith("data:")
        ? saveBase64Image({
            imageData: image,
            userId: req.user.id,
          })
        : image;
      updates.isAvatarImageSet = true;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCurrentUserController = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const logoutController = async (req, res) =>
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
