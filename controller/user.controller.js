/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
} from '../utils/emailSend.js';
import { createError } from '../middleware/error.handler.js';
import userModel from '../models/user.model.js';
import linkModel from '../models/link.model.js';
import followupModel from '../models/followup.model.js';

// register user
export const handleReg = async (req, res, next) => {
  const { name, email, password, username } = req.body;

  console.log(req.body);

  if (!name || !email || !password || !username) {
    return next(createError(400, 'All fields are required!'));
  }

  try {
    let user = await userModel.findOne({ email });
    if (user) {
      return next(createError(400, 'Email already exists!'));
    }
    let usernameExists = await userModel.findOne({ username });
    if (usernameExists) {
      return next(createError(400, 'Username already exists!'));
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      username,
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).send('Registration complete!');
  } catch (error) {
    next(error);
  }
};

//admin create user
export const adminCreateUser = async (req, res, next) => {
  const { img, username, name, email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    const usernameExists = await userModel.findOne({ username });
    if (user) {
      return next(createError(400, { email: 'Email already exists!' }));
    } else if (usernameExists) {
      return next(createError(400, { username: 'Username already exists! Please try another username.' }));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      img,
      username,
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).send({ message: 'User Created Successfully!' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return next(createError(400, errors));
    }
    next(error);
  }
};

//get all users
export const getAllUsers = async (req, res, next) => {
  const { search } = req.query;
  try {
    const users = await userModel.find({
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }).sort({ createdAt: -1 });
    const filteredUsers = users.filter(user => user.role !== 'admin');
    res.status(200).send(filteredUsers);
  } catch (error) {
    next(error);
  }
};

//get single user with all links
export const getSingleUser = async (req, res, next) => {
  const { username } = req.params;
  try {
    const user = await userModel.findOne({ username });
    if (!user) {
      return next(createError(404, 'User not found!'));
    }
    // Get all links for this user
    const userLinks = await linkModel.find({ user: user._id }).sort({ createdAt: -1 });

    // Convert user to object and add links
    const userWithLinks = user.toObject();
    userWithLinks.links = userLinks;
    res.status(200).send(userWithLinks);
  } catch (error) {
    next(error);
  }
};
















// verify email
// export const verifyEmail = async (req, res, next) => {
//   const { token } = req.query;

//   if (!token) {
//     return next(createError(400, 'Invalid token'));
//   }

//   try {
//     const user = await userModel.findOne({
//       verificationToken: token,
//       verificationTokenExpiry: { $gt: Date.now() },
//     });

//     if (!user) {
//       return next(createError(400, 'Invalid or expired token'));
//     }

//     user.isVerified = true;
//     user.verificationToken = undefined;
//     user.verificationTokenExpiry = undefined;

//     await user.save();
//     res.status(200).send('Email verified successfully!');
//   } catch (error) {
//     next(error);
//   }
// };

// resend verify email
// export const resendVerifyEmail = async (req, res, next) => {
//   const { email } = req.body;

//   if (!email) {
//     return next(createError(400, 'Email is required!'));
//   }

//   try {
//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return next(createError(404, 'User not found!'));
//     }

//     if (user.isVerified) {
//       return next(createError(400, 'Email is already verified!'));
//     }

//     const verificationToken = crypto.randomBytes(32).toString('hex');
//     user.verificationToken = verificationToken;
//     user.verificationTokenExpiry = Date.now() + 3600000; // 1 hour

//     await user.save();

//     await sendVerificationEmail(user.email, verificationToken);

//     res.status(200).send('Verification email resent successfully!');
//   } catch (error) {
//     next(error);
//   }
// };

// login user
export const handleLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return next(createError(404, 'Email Not Found'));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(createError(400, 'Incorrect Password'));

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userDetails } = user._doc;

    res.status(200).send({
      jwt: token,
      message: 'Login successful.',
      user: userDetails,
    });
  } catch (error) {
    next(error);
  }
};


// get logged user info
export const getLoggedUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    const { password: _, ...userDetails } = user._doc;
    res.status(200).send({
      ...user.toObject(),
    });
  } catch (error) {
    next(error);
  }
};

//admin update user
export const adminUpdateUser = async (req, res, next) => {
  const { id } = req.params;
  const { name, img, isBlocked } = req.body;

  // if user is isBlocked, all links status will be deactive
  if (isBlocked) {
    await linkModel.updateMany({ user: id }, { isActive: false });
    await followupModel.updateMany({ user: id }, { enabled: false });
  }

  try {
    await userModel.findByIdAndUpdate(id, { name, img, isBlocked }, { new: true });
    res.status(200).send({ message: 'User updated successfully!' });
  } catch (error) {
    next(error);
  }
};

//remove user by admin
export const adminRemoveUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    await userModel.findByIdAndDelete(id);
    res.status(200).send({ message: 'User removed successfully!' });
  } catch (error) {
    next(error);
  }
};


// update logged user
export const updateLoggedUser = async (req, res, next) => {
  const { name, img } = req.body;

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { name, img },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(createError(404, 'User not found!'));
    }

    res.status(200).send('Update SuccessFull');
  } catch (error) {
    next(error);
  }
};



// change password
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      createError(400, 'Current password and new password are required')
    );
  }

  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(createError(400, 'Current password is incorrect'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).send('Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// forgot password
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/password-reset/${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl, user.username);

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
};

// reset password
export const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send('Invalid token or token has expired');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    await sendPasswordResetConfirmationEmail(user.email);

    res.status(200).json({ message: 'Password reset successfully. You can now login with your new password' });
  } catch (error) {
    next(error);
  }
};
