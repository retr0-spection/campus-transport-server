import jwt from "jsonwebtoken";
import User from "../../models/User.js"; // Assuming the User model is in the 'models' directory
import dotenv from "dotenv";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
dotenv.config();

const googleClientID =
  "852854144164-bpgaon6krp6nf795kfe04r4rdqbnvio3.apps.googleusercontent.com";
const audienceClientID =
  "852854144164-m2frvklvaeesil11dc8f6sfkf9r2rdap.apps.googleusercontent.com";
const googleClient = new OAuth2Client(googleClientID);

// Secret key for JWT (ideally stored in environment variables)
const JWT_SECRET = process.env.SECRETKEY || "your_jwt_secret_key";
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "1h";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your_refresh_secret_key";
const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION || "7d";

// Register a new user
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({
      email,
      password, // The password will be hashed in the User model's pre-save hook
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 1. Call the Google SDK from the frontend using whatever frontend
//2. Extract the code or access token and send to your backend for verification.
//3. Use your backend Google api to verify the code or token.
//4. If verified, sign them in the backend and then send a response to frontend

export const googleAuth = async (req, res) => {
  try {
    // get the code from frontend
    const code = req.headers["x-google-token"];
    console.log(code);
    const ticket = await googleClient.verifyIdToken({
      idToken: code,
      audience: googleClientID,
    });

    const payload = ticket.getPayload();
    // create user and/or get tokens
    let user;
    try {
      //user exists
      user = await User.findOne({
        email: payload.email,
      });

      if (!user) {
        user = new User({
          email: payload.email,
          googleAuth: payload,
        });
      } else {
        user.googleAuth = payload;
      }
      await user.save();
    } catch (err) {
      console.log(err);
    } finally {
      // Create JWT token
      console.log(user);
      const token = jwt.sign({ id: user._id, email:user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION,
      });
      const refreshToken = jwt.sign({ id: user._id,  email:user.email }, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRATION,
      });
      res.status(200).json({
        message: "Authentication successful",
        token,
        refresh_token: refreshToken,
        email:user.email
      });
    }
  } catch (error) {
    console.error("Error saving code:", error);
    res.status(500).json({ message: "Failed to save code" });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check the password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id,  email:user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });
    const refreshToken = jwt.sign({ id: user._id , email:user.email}, REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRATION,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      refresh_token: refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout user
export const logout = (req, res) => {
  // For stateless JWT authentication, you can handle logout on the client side by deleting the token.
  res.status(200).json({ message: "Logout successful" });
};

// Get current user's profile
export const me = async (req, res) => {
  try {
    const user = req.user; //received from middleware

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.serializeData());
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Refresh JWT token
export const refresh = (req, res) => {
  const refreshToken = req.headers.authorization.split(" ")[1];

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const newToken = jwt.sign({ id: decoded.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });

    res.status(200).json({
      token: newToken,
      refresh_token: refreshToken, // Optionally, issue a new refresh token here as well
    });
  } catch (error) {
    res
      .status(403)
      .json({ message: "Invalid refresh token", error: error.message });
  }
};
