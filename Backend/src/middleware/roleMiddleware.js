export const roleMiddleware = (roles) => (req, res, next) => {
  console.log(req.user.role);
  console.log(req.user)
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
