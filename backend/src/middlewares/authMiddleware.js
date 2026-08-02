const jwt = require("jsonwebtoken");

// Verify Token
exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    req.user = decoded; // { id, role, employeeId }
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Check Roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Role ${req.user.role} is not authorized` });
    }
    next();
  };
};
