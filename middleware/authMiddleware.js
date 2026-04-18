const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require('dotenv').config();

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  
  if (!authorization || !authorization.startsWith("Bearer")) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    token = authorization.split(" ")[1];
    
    // Using JWT_SECRET (matches your .env)
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      console.error("JWT_SECRET is not set in .env file");
      return res.status(500).json({ message: "Server configuration error" });
    }
    
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.userID).select("-password");
    
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = checkUserAuth;