import User from "../models/userModel.js"; 
import express from'express';
import { getCurrentUser, loginUser, registerUser, updatePassword, updateProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import { sendOtp, verifyOtp } from "../controllers/userController.js";
import { upload } from "../middleware/upload.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/send-otp", sendOtp);
userRouter.post("/verify-otp", verifyOtp);

// protected Routes
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.put("/profile", authMiddleware, updateProfile);
userRouter.put("/password", authMiddleware, updatePassword);

userRouter.put(
  "/profile-image",
  authMiddleware,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const imageUrl = `/uploads/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        userId,
        { profilePic: imageUrl },
        { new: true }
      );

      res.json({ user });

    } catch (err) {
      res.status(500).json({ message: "Upload failed" });
    }
  }
);
export default userRouter;