const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { redisClient } = require("../config/redis");

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. If not in header, check cookie
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = payload;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Check if token is blacklisted in Redis
    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) {
      return res.status(401).json({ message: "Token revoked" });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: err.message || "Unauthorized" });
  }
};

module.exports = authMiddleware;