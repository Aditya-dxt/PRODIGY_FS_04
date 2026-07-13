const jwt = require("jsonwebtoken");
const User = require("../models/User");

const AVATAR_COLORS = ["#5b3df5", "#e0578e", "#2fa8a0", "#e08a2f", "#3f7de0", "#8a5be0"];
const pickColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const sendAuthResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
    },
  });
};

exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Please provide name, username, email and password" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(409).json({ message: "That username is already taken" });
    }

    const user = await User.create({ name, username, email, password, avatarColor: pickColor(name) });
    sendAuthResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendAuthResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatarColor: req.user.avatarColor,
    },
  });
};

// @route GET /api/auth/users?search=  — for starting new DMs
exports.searchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { _id: { $ne: req.user._id } };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    const users = await User.find(query).select("name email avatarColor isOnline lastSeen").limit(30);
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};
