import Joi from "joi";

const baseUserSchema = {
  name: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(15)
    .pattern(/^[a-zA-Z0-9_-]{3,15}$/)
    .messages({
      "string.pattern.base":
        "Name must be between 3 and 15 characters long and contain only letters, numbers, underscores, and hyphens",
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .pattern(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/)
    .messages({
      "string.pattern.base": "Invalid email format",
    }),

  password: Joi.string()
    .pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/)
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters and include upper, lower, number, and special char",
    }),

  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .messages({ "any.only": "Passwords do not match" }),

  phone: Joi.string()
    .pattern(/^01[0-9]{9}$/)
    .messages({
      "string.pattern.base": "Phone number must be 11 digits and start with 01",
    }),

  profileImage: Joi.string().uri(),
  bio: Joi.string().max(300),

  organizationName: Joi.string().min(3).max(100),
  organizationDescription: Joi.string().max(500),

  provider: Joi.string().valid("local", "google", "facebook"),
  role: Joi.string().valid("user", "organizer", "admin"),

  address: Joi.object({
    country: Joi.string().allow(""),
    city: Joi.string().allow(""),
    street: Joi.string().allow(""),
    zip: Joi.string().allow(""),
  }),

  // ignore these in client input:
  verified: Joi.boolean(),
  isActive: Joi.boolean(),
  lastLogin: Joi.date(),
  resetPasswordToken: Joi.string().allow(null),
  resetPasswordExpires: Joi.date().allow(null),
  googleId: Joi.string().allow(null),
  facebookId: Joi.string().allow(null),
  deletedAt: Joi.date().allow(null),
};

export const getUserValidationSchema = ({ isUpdate = false } = {}) => {
  let schema = { ...baseUserSchema };

  delete schema.resetPasswordToken;
  delete schema.resetPasswordExpires;
  delete schema.googleId;
  delete schema.facebookId;
  delete schema.verified;
  delete schema.isActive;
  delete schema.lastLogin;
  delete schema.deletedAt;

  if (isUpdate) {
    Object.keys(schema).forEach((key) => {
      schema[key] = schema[key].optional();
    });
    return Joi.object(schema).min(1);
  }

  return Joi.object({
    name: schema.name.required(),
    email: schema.email.required(),
    password: schema.password.required(),
    confirmPassword: schema.confirmPassword.required(),
    phone: schema.phone.required(),
    profileImage: schema.profileImage.optional(),
    bio: schema.bio.optional(),
    provider: schema.provider.optional(),
    address: schema.address.optional(),
    role: schema.role.optional(),
    organizationName: schema.organizationName.optional(),
    organizationDescription: schema.organizationDescription.optional(),
  });
};

export const getOrganizerValidationSchema = ({ isUpdate = false } = {}) => {
  let schema = { ...baseUserSchema };

  delete schema.resetPasswordToken;
  delete schema.resetPasswordExpires;
  delete schema.googleId;
  delete schema.facebookId;
  delete schema.verified;
  delete schema.isActive;
  delete schema.lastLogin;
  delete schema.deletedAt;

  if (isUpdate) {
    Object.keys(schema).forEach((key) => {
      schema[key] = schema[key].optional();
    });
    return Joi.object(schema).min(1);
  }

  return Joi.object({
    name: schema.name.required(),
    email: schema.email.required(),
    password: schema.password.required(),
    confirmPassword: schema.confirmPassword.required(),
    phone: schema.phone.required(),
    profileImage: schema.profileImage.optional(),
    bio: schema.bio.optional(),
    provider: schema.provider.optional(),
    address: schema.address.required(),
    role: schema.role.optional(),
    organizationName: schema.organizationName.required(),
    organizationDescription: schema.organizationDescription.required(),
  });
};
