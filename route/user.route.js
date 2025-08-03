import express from 'express';
import {
  adminCreateUser,
  adminRemoveUser,
  adminUpdateUser,
  changePassword,
  forgotPassword,
  getAllUsers,
  getLoggedUser,
  getSingleUser,
  handleLogin,
  handleReg,
  resetPassword,
  // resendVerifyEmail,
  // resetPassword,
  updateLoggedUser,
  // verifyEmail,
} from '../controller/user.controller.js';
import { verifyToken } from '../middleware/verify.token.js';
import { isAdmin } from '../middleware/isAdmin.js';

export const userRoute = express.Router();

userRoute.post('/admin/create-user',verifyToken, isAdmin, adminCreateUser);

userRoute.post('/register', handleReg);

userRoute.post('/login', handleLogin);

userRoute.get('/all-users', verifyToken,isAdmin, getAllUsers);

userRoute.get('/details/:username',verifyToken, getSingleUser);

// userRoute.post('/verify-email', verifyEmail);

// userRoute.post('/resend-verify-email', resendVerifyEmail);

userRoute.get('/me', verifyToken, getLoggedUser);

userRoute.put('/update', verifyToken, updateLoggedUser);

userRoute.put('/admin/update/:id', verifyToken,isAdmin, adminUpdateUser);

userRoute.delete('/admin/remove/:id', verifyToken,isAdmin, adminRemoveUser);

userRoute.put('/change-password', verifyToken, changePassword);

userRoute.post('/forgot-password', forgotPassword); //for user forgot password

userRoute.post('/reset-password', resetPassword); //for submit new password
