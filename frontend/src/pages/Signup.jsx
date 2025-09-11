import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../services/api";

const SignUpPage = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: {
      country: "",
      city: "",
      street: "",
      zip: "",
    },
  });

  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    city: "",
  });

  // Validation patterns (matching backend requirements)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^01[0-9]{9}$/;

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    let strength = "Very Weak";
    let color = "bg-red-500";

    if (score >= 4) {
      strength = "Strong";
      color = "bg-green-500";
    } else if (score >= 3) {
      strength = "Medium";
      color = "bg-yellow-500";
    } else if (score >= 2) {
      strength = "Weak";
      color = "bg-orange-500";
    }

    return { checks, score, strength, color, percentage: (score / 5) * 100 };
  };

  const [passwordStrength, setPasswordStrength] = useState(
    checkPasswordStrength("")
  );

  // Real-time field validation
  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "firstName":
        if (!value.trim()) {
          error = "First name is required";
        } else if (value.trim().length < 3) {
          error = "First name must be at least 3 characters";
        } else if (value.trim().length > 15) {
          error = "First name must be no more than 15 characters";
        } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          error =
            "First name can only contain letters, numbers, underscores, and hyphens";
        }
        break;
      case "lastName":
        if (!value.trim()) {
          error = "Last name is required";
        } else if (value.trim().length < 3) {
          error = "Last name must be at least 3 characters";
        } else if (value.trim().length > 15) {
          error = "Last name must be no more than 15 characters";
        } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          error =
            "Last name can only contain letters, numbers, underscores, and hyphens";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!emailRegex.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters";
        } else {
          const strength = checkPasswordStrength(value);
          if (strength.score < 3) {
            error =
              "Password is too weak. Include uppercase, lowercase, numbers, and special characters";
          }
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== signupForm.password) {
          error = "Passwords do not match";
        }
        break;
      case "phone":
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!phoneRegex.test(value)) {
          error = "Please enter a valid phone number";
        }
        break;
      case "country":
        if (!value.trim()) {
          error = "Country is required";
        }
        break;
      case "city":
        if (!value.trim()) {
          error = "City is required";
        }
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error === "";
  };

  const validateForm = () => {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
      address,
    } = signupForm;

    const validations = [
      validateField("firstName", firstName),
      validateField("lastName", lastName),
      validateField("email", email),
      validateField("password", password),
      validateField("confirmPassword", confirmPassword),
      validateField("phone", phone),
      validateField("country", address.country),
      validateField("city", address.city),
    ];

    return validations.every((isValid) => isValid);
  };

  const handleSignupSubmit = async () => {
    console.log("Signup submitted:", signupForm);

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsLoading(true);

    try {
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        phone,
        address,
      } = signupForm;

      const response = await authAPI.register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        phone,
        address,
      });

      console.log("✅ Signup successful:", response.data);

      // Show success message with user's name
      toast.success(
        `Welcome to Tazkarti, ${firstName}! 🎉 Please check your email for verification code.`
      );

      // Call success callback with user email for verification
      if (onSignupSuccess) {
        onSignupSuccess(email, "user");
      } else {
        // Fallback navigation if no callback provided
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Signup failed:", error.response?.data || error.message);

      // Handle different error scenarios with user-friendly messages
      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.status === 400) {
        const backendMessage =
          error.response.data?.error || error.response.data?.message;

        if (backendMessage) {
          // Handle specific backend error messages
          if (backendMessage.includes("Email already exists")) {
            errorMessage =
              "An account with this email already exists. Please try logging in instead.";
          } else if (backendMessage.includes("Phone number already exists")) {
            errorMessage =
              "This phone number is already registered. Please use a different phone number.";
          } else if (backendMessage.includes("Passwords do not match")) {
            errorMessage =
              "Passwords do not match. Please check your password confirmation.";
          } else if (
            backendMessage.includes("Name must be between 3 and 15 characters")
          ) {
            errorMessage =
              "First name and last name must be between 3 and 15 characters long.";
          } else if (backendMessage.includes("Invalid email format")) {
            errorMessage = "Please enter a valid email address.";
          } else if (backendMessage.includes("Invalid phone number format")) {
            errorMessage =
              "Please enter a valid phone number (format: 01xxxxxxxxx).";
          } else if (
            backendMessage.includes("Password must be at least 8 characters")
          ) {
            errorMessage =
              "Password must be at least 8 characters long with uppercase, lowercase, numbers, and special characters.";
          } else {
            // Use the backend message directly if it doesn't match specific patterns
            errorMessage = backendMessage;
          }
        } else {
          errorMessage =
            "Invalid registration data. Please check your information.";
        }
      } else if (error.response?.status === 409) {
        errorMessage =
          "An account with this email already exists. Please try logging in instead.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.error || error.response?.data?.message) {
        errorMessage = error.response.data.error || error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            {/* First Name Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-900 mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={signupForm.firstName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignupForm({ ...signupForm, firstName: value });
                    setTimeout(() => validateField("firstName", value), 300);
                  }}
                  onBlur={(e) => validateField("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.firstName
                      ? "border-red-500 focus:ring-red-500"
                      : signupForm.firstName && !fieldErrors.firstName
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                  style={{ fontFamily: "Roboto, sans-serif" }}
                />
              </div>
              {fieldErrors.firstName && (
                <p
                  className="mt-1 text-sm text-red-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {fieldErrors.firstName}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-900 mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={signupForm.lastName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignupForm({ ...signupForm, lastName: value });
                    setTimeout(() => validateField("lastName", value), 300);
                  }}
                  onBlur={(e) => validateField("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.lastName
                      ? "border-red-500 focus:ring-red-500"
                      : signupForm.lastName && !fieldErrors.lastName
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                  style={{ fontFamily: "Roboto, sans-serif" }}
                />
              </div>
              {fieldErrors.lastName && (
                <p
                  className="mt-1 text-sm text-red-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {fieldErrors.lastName}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-900 mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Phone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={signupForm.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignupForm({ ...signupForm, phone: value });
                    setTimeout(() => validateField("phone", value), 300);
                  }}
                  onBlur={(e) => validateField("phone", e.target.value)}
                  placeholder="Enter your phone number (e.g., 01234567890)"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : signupForm.phone && !fieldErrors.phone
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                  style={{ fontFamily: "Roboto, sans-serif" }}
                />
              </div>
              {fieldErrors.phone && (
                <p
                  className="mt-1 text-sm text-red-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Address Fields */}
            <div>
              <label
                className="block text-sm font-medium text-gray-900 mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Address
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={signupForm.address.country}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignupForm({
                      ...signupForm,
                      address: {
                        ...signupForm.address,
                        country: value,
                      },
                    });
                    setTimeout(() => validateField("country", value), 300);
                  }}
                  onBlur={(e) => validateField("country", e.target.value)}
                  placeholder="Enter your country"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.country
                      ? "border-red-500 focus:ring-red-500"
                      : signupForm.address.country && !fieldErrors.country
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                  style={{ fontFamily: "Roboto, sans-serif" }}
                />
                {fieldErrors.country && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {fieldErrors.country}
                  </p>
                )}
                <input
                  type="text"
                  value={signupForm.address.city}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignupForm({
                      ...signupForm,
                      address: { ...signupForm.address, city: value },
                    });
                    setTimeout(() => validateField("city", value), 300);
                  }}
                  onBlur={(e) => validateField("city", e.target.value)}
                  placeholder="Enter your city"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.city
                      ? "border-red-500 focus:ring-red-500"
                      : signupForm.address.city && !fieldErrors.city
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                  style={{ fontFamily: "Roboto, sans-serif" }}
                />
                {fieldErrors.city && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {fieldErrors.city}
                  </p>
                )}
                <input
                  type="text"
                  value={signupForm.address.street}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignupForm({
                      ...signupForm,
                      address: {
                        ...signupForm.address,
                        street: value,
                      },
                    });
                    setTimeout(() => validateField("street", value), 300);
                  }}
                  onBlur={(e) => validateField("street", e.target.value)}
                  placeholder="Enter your street"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.street
                      ? "border-red-500 focus:ring-red-500"
                      : signupForm.address.street && !fieldErrors.street
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                  style={{ fontFamily: "Roboto, sans-serif" }}
                />
                {fieldErrors.street && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {fieldErrors.street}
                  </p>
                )}
                <input
                  type="text"
                  value={signupForm.address.zip}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignupForm({
                      ...signupForm,
                      address: { ...signupForm.address, zip: value },
                    });
                    setTimeout(() => validateField("zip", value), 300);
                  }}
                  onBlur={(e) => validateField("zip", e.target.value)}
                  placeholder="Enter your zip"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.zip
                      ? "border-red-500 focus:ring-red-500"
                      : signupForm.address.zip && !fieldErrors.zip
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                  style={{ fontFamily: "Roboto, sans-serif" }}
                />
                {fieldErrors.zip && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {fieldErrors.zip}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-900 mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignupForm({ ...signupForm, email: value });
                    setTimeout(() => validateField("email", value), 300);
                  }}
                  onBlur={(e) => validateField("email", e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : signupForm.email && !fieldErrors.email
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                  style={{ fontFamily: "Roboto, sans-serif" }}
                />
              </div>
              {fieldErrors.email && (
                <p
                  className="mt-1 text-sm text-red-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-900 mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={signupForm.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignupForm({ ...signupForm, password: value });
                    setPasswordStrength(checkPasswordStrength(value));
                    setTimeout(() => validateField("password", value), 300);
                  }}
                  onBlur={(e) => validateField("password", e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : signupForm.password && !fieldErrors.password
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                  style={{ fontFamily: "Roboto, sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {signupForm.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ fontFamily: "Inter, sans-serif" }}>
                      Password Strength:
                    </span>
                    <span
                      className={`font-medium ${
                        passwordStrength.strength === "Strong"
                          ? "text-green-600"
                          : passwordStrength.strength === "Medium"
                          ? "text-yellow-600"
                          : passwordStrength.strength === "Weak"
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {passwordStrength.strength}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.percentage}%` }}
                    ></div>
                  </div>
                  <div
                    className="mt-1 text-xs text-gray-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <div className="grid grid-cols-2 gap-1">
                      <span
                        className={
                          passwordStrength.checks.length
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ✓ 8+ characters
                      </span>
                      <span
                        className={
                          passwordStrength.checks.uppercase
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ✓ Uppercase
                      </span>
                      <span
                        className={
                          passwordStrength.checks.lowercase
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ✓ Lowercase
                      </span>
                      <span
                        className={
                          passwordStrength.checks.number
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ✓ Number
                      </span>
                      <span
                        className={
                          passwordStrength.checks.special
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        ✓ Special char
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {fieldErrors.password && (
                <p
                  className="mt-1 text-sm text-red-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-900 mb-2"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={signupForm.confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignupForm({
                      ...signupForm,
                      confirmPassword: value,
                    });
                    setTimeout(
                      () => validateField("confirmPassword", value),
                      300
                    );
                  }}
                  onBlur={(e) =>
                    validateField("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : signupForm.confirmPassword &&
                        !fieldErrors.confirmPassword
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                  style={{ fontFamily: "Roboto, sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p
                  className="mt-1 text-sm text-red-600"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Register Button */}
            <button
              onClick={handleSignupSubmit}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              style={{
                backgroundColor: "#0052CC",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Register
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className="px-2 bg-white text-gray-500"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  or continue with
                </span>
              </div>
            </div>

            {/* Google Button */}
            <a
              href={`${
                import.meta.env.VITE_API_URL || "http://localhost:5000"
              }/auth/google`}
              className="w-full border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
              style={{
                fontFamily: "Inter, sans-serif",
                textDecoration: "none",
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </a>

            {/* Login Link */}
            <p
              className="text-center text-sm text-gray-600"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Login
              </a>
            </p>
          </div>

          {/* Terms */}
          <p
            className="mt-6 text-xs text-center text-gray-500"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
