import { log } from "console";
import User from "../model/User.model.js";
import errorResponse from "../utils/ErrorResponse.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const registerUser = async (req, res) => {
  // create a new user
  // get data
  // validate
  // check if user already exist
  // if not, create the user in db
  // create a verification token,
  // save token in db
  // send token in email to user
  // send a success status to user

  const { name, email, password } = req.body;

  // data validation
  if (!name || !email || !password) {
    throw new errorResponse("All fields are required", 400);
  }

  // find existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log(existingUser);
    throw new errorResponse("User already exists", 400);
  }

  try {
    // create user
    const user = await User.create({ name, email, password });

    if (!user) {
      // throw new errorResponse('User not registered', 400)
      return res.status(400).json({
        success: "false",
        message: "User not registered",
      });
    }

    // create verification token
    const token = crypto.randomBytes(16).toString("hex");
    user.verificationToken = token;
    await user.save();

    // send verification email
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const emailOptions = {
      from: process.env.MAILTRAP_SENDEREMAIL, // sender address
      to: user.email, // list of receivers
      subject: "Verify your email", // Subject line
      text: `Please click the link to verify:
      ${process.env.BASE_URL}/api/v1/users/verify/${token}`, // plain text body
      // html: "<b>Hello world?</b>", // html body
    };

    await transporter.sendMail(emailOptions);

    return res.status(200).json({
      success: "true",
      message: "User registered successfully!",
    });
  } catch (error) {
    throw new errorResponse("Failed to register user", 400);
    // throw new errorResponse(error.message, error.statusCode)
  }
};

const verifyUser = async (req, res) => {
  // get token from url
  // validate
  // find user based on token
  // set isVerified field to true
  // remove verification token from the database
  // save database
  // return response

  // get token from url
  try {
    const { token } = req.params;
    if (!token) {
      // throw new errorResponse('Invalid token', 400)
      return res.status(400).json({
        success: "false",
        message: "Invalid token",
      });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      // throw new errorResponse('Invalid token, user not found', 400)
      return res.status(400).json({
        success: "false",
        message: "Invalid token, user not found",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    return res.status(200).json({
      success: "true",
      message: "User successfully verified.",
    });
  } catch (error) {
    throw new errorResponse("User not verified.", 400);
  }
};

const userLogin = async (req, res) => {
  // get user email and password
  // check if the user exits
  // if user exits, check password
  const { email, password } = req.body;

  if (!email || !password) {
    throw new errorResponse("All fields required", 400);
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // throw new errorResponse('Invalid email or password.', 400)
      return res.status(400).json({
        success: "false",
        message: "Invalid email or password",
      });
    }

    if (user.isVerified !== true) {
      return res.status(400).json({
        success: "false",
        message: "User not verified. Please verify through your email.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      console.log(`${user.name} LoggedIn`);
    }

    if (!isMatch) {
      // throw new errorResponse('Invalid password.', 400)
      return res.status(400).json({
        success: "false",
        message: "Invalid password.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    throw new errorResponse("Login unsuccessful", 400);
    // console.error(error)
    // return next(error)
  }
};

const getProfile = async (req, res) => {
  // get token from the user
  // decrypt token to verify user
  //

  const { id } = req.user;

  try {
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    throw new errorResponse("Cannot reach profile", 400);
  }
};

const userLogout = async (req, res) => {};
const forgotPassword = async (req, res) => {};
const resetPassword = async (req, res) => {};
export {
  registerUser,
  verifyUser,
  userLogin,
  getProfile,
  userLogout,
  forgotPassword,
  resetPassword,
};
