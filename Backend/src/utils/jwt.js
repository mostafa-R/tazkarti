import jwt from "jsonwebtoken";

export const generateToken = (user, res) => {
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      userName: user.userName,
      phone: user.phone,
      organizationName: user.organizationName,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
  // Set cookie options based on environment
  // In production: secure=true, sameSite='none' (for cross-site cookies)
  // In development: secure=false, sameSite='lax' (for local testing)
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use 'none' for cross-site in prod, 'lax' for local
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
};
