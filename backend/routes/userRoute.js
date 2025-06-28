import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  updatePassword,
} from '../controller/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const userRouter = express.Router();

//public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

//private routes
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.put("/profile", authMiddleware, updateUserProfile);
userRouter.put("/password", authMiddleware, updatePassword);

export default userRouter;