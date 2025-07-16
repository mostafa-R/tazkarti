import jwt from "jsonwebtoken";

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const fieldErrors = {};

    error.details.forEach((err) => {
      const field = err.path[0];

      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }

      const message = err.message.replace(/["']/g, "");

      if (!fieldErrors[field].includes(message)) {
        fieldErrors[field].push(message);
      }
    });

    const formattedErrors = Object.entries(fieldErrors).map(
      ([field, messages]) => ({
        field,
        messages,
      })
    );

    return res.status(400).json({ errors: formattedErrors });
  }

  next();
};

export const authMiddleware = (req, res, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") || req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};


