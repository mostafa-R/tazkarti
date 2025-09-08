import {
  ArrowLeft,
  Building,
  Camera,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Hash,
  Home,
  Loader,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userAPI } from "../services/api";

const UserProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    address: {
      country: "",
      city: "",
      street: "",
      zip: "",
    },
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Tabs configuration
  const tabs = [
    { id: "profile", label: t("profile.tabs.profile"), icon: User },
    { id: "security", label: t("profile.tabs.security"), icon: Settings },
    { id: "bookings", label: t("profile.tabs.bookings"), icon: CreditCard },
  ];

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      const userData = response.data;

      setUser(userData);
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        address: userData.address || {
          country: "",
          city: "",
          street: "",
          zip: "",
        },
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(t("profile.errors.loadProfile"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested address fields
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("profile.errors.firstNameRequired");
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t("profile.errors.lastNameRequired");
    }

    if (formData.phone && !/^01[0-2,5]{1}[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = t("profile.errors.phoneInvalid");
    }

    // Address validation
    if (formData.address.street && !formData.address.city) {
      newErrors.addressCity =
        t("profile.errors.cityRequired") ||
        "City is required when street is provided";
    }
    if (formData.address.city && !formData.address.country) {
      newErrors.addressCountry =
        t("profile.errors.countryRequired") ||
        "Country is required when city is provided";
    }

    // Password validation (only if trying to change password)
    if (showPasswordChange) {
      if (!formData.oldPassword) {
        newErrors.oldPassword = t("profile.errors.oldPasswordRequired");
      }

      if (!formData.newPassword) {
        newErrors.newPassword = t("profile.errors.newPasswordRequired");
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = t("profile.errors.passwordMinLength");
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = t("profile.errors.passwordMismatch");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("profile.errors.fixErrors"));
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address,
      };

      // Add password fields if changing password
      if (showPasswordChange && formData.newPassword) {
        updateData.oldPassword = formData.oldPassword;
        updateData.newPassword = formData.newPassword;
        updateData.confirmPassword = formData.confirmPassword;
      }

      const response = await userAPI.updateProfile(updateData);

      setUser(response.data.user);
      toast.success(t("profile.success.updated"));

      // Reset password fields
      if (showPasswordChange) {
        setFormData((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setShowPasswordChange(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(
        error.response?.data?.message || t("profile.errors.updateFailed")
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("profile.errors.invalidImageType"));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profile.errors.imageTooLarge"));
      return;
    }

    try {
      setImageUploading(true);
      await userAPI.uploadProfileImage(file);
      toast.success(t("profile.success.imageUploaded"));
      fetchUserProfile(); // Refresh to get new image URL
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        error.response?.data?.message || t("profile.errors.imageUploadFailed")
      );
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={40}
            className="animate-spin mx-auto text-blue-600 mb-4"
          />
          <p className="text-gray-600">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/home")}
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center mr-4"
            >
              <ArrowLeft className="mr-2" size={20} />
              {t("profile.backToHome")}
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("profile.title")}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              {/* Profile Picture */}
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={
                      user?.profileImage ||
                      `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=3B82F6&color=fff&size=120`
                    }
                    alt={t("profile.profilePicture")}
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={imageUploading}
                    />
                  </label>
                  {imageUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <Loader size={20} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={20} className="mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-gray-900">
                    {t("profile.tabs.profile")}
                  </h2>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          {t("profile.firstName")} *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.firstName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder={t("profile.firstNamePlaceholder")}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          {t("profile.lastName")} *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.lastName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder={t("profile.lastNamePlaceholder")}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <Mail size={16} className="inline mr-1" />
                        {t("profile.email")}
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {t("profile.emailReadOnly")}
                      </p>
                    </div>

                    {/* Current Address Display */}
                    {user?.address && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          {t("profile.currentAddress") || "Current Address"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {user.address.country && (
                            <div>
                              <span className="text-gray-600 font-medium">
                                Country:
                              </span>
                              <span className="ml-2 text-gray-900">
                                {user.address.country}
                              </span>
                            </div>
                          )}
                          {user.address.city && (
                            <div>
                              <span className="text-gray-600 font-medium">
                                City:
                              </span>
                              <span className="ml-2 text-gray-900">
                                {user.address.city}
                              </span>
                            </div>
                          )}
                          {user.address.street && (
                            <div>
                              <span className="text-gray-600 font-medium">
                                Street:
                              </span>
                              <span className="ml-2 text-gray-900">
                                {user.address.street}
                              </span>
                            </div>
                          )}
                          {user.address.zip && (
                            <div>
                              <span className="text-gray-600 font-medium">
                                ZIP Code:
                              </span>
                              <span className="ml-2 text-gray-900">
                                {user.address.zip}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        <Phone size={16} className="inline mr-1" />
                        {t("profile.phone")}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder={t("profile.phonePlaceholder")}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          <MapPin size={16} className="inline mr-1" />
                          {t("profile.address.address")}
                        </label>
                        <p className="text-sm text-gray-600 mb-4">
                          {t("profile.address.helpText") ||
                            "Please provide your complete address information. All fields are optional but recommended for better service."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Country */}
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">
                            <Globe size={14} className="inline mr-1" />
                            {t("profile.address.country") || "Country"}
                          </label>
                          <input
                            type="text"
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleInputChange}
                            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.addressCountry
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder={
                              t("profile.address.countryPlaceholder") ||
                              "Enter country"
                            }
                          />
                          {errors.addressCountry && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.addressCountry}
                            </p>
                          )}
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">
                            <Building size={14} className="inline mr-1" />
                            {t("profile.address.city") || "City"}
                          </label>
                          <input
                            type="text"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleInputChange}
                            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.addressCity
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder={
                              t("profile.address.cityPlaceholder") ||
                              "Enter city"
                            }
                          />
                          {errors.addressCity && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.addressCity}
                            </p>
                          )}
                        </div>

                        {/* Street */}
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">
                            <Home size={14} className="inline mr-1" />
                            {t("profile.address.street") || "Street"}
                          </label>
                          <input
                            type="text"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={
                              t("profile.address.streetPlaceholder") ||
                              "Enter street address"
                            }
                          />
                        </div>

                        {/* ZIP Code */}
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">
                            <Hash size={14} className="inline mr-1" />
                            {t("profile.address.zip") || "ZIP Code"}
                          </label>
                          <input
                            type="text"
                            name="address.zip"
                            value={formData.address.zip}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={
                              t("profile.address.zipPlaceholder") ||
                              "Enter ZIP code"
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        {t("profile.bio")}
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("profile.bioPlaceholder")}
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {saving ? (
                          <Loader size={20} className="animate-spin mr-2" />
                        ) : (
                          <Save size={20} className="mr-2" />
                        )}
                        {saving
                          ? t("profile.saving")
                          : t("profile.saveChanges")}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-gray-900">
                    {t("profile.tabs.security")}
                  </h2>

                  <div className="space-y-6">
                    {!showPasswordChange ? (
                      <div className="border border-gray-200 rounded-lg p-6 text-center">
                        <Settings
                          size={48}
                          className="mx-auto text-gray-400 mb-4"
                        />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {t("profile.security.changePassword")}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {t("profile.security.passwordDesc")}
                        </p>
                        <button
                          onClick={() => setShowPasswordChange(true)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {t("profile.security.changePasswordButton")}
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleUpdateProfile}
                        className="space-y-6"
                      >
                        {/* Current Password */}
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            {t("profile.security.currentPassword")} *
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.old ? "text" : "password"}
                              name="oldPassword"
                              value={formData.oldPassword}
                              onChange={handleInputChange}
                              className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.oldPassword
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder={t(
                                "profile.security.currentPasswordPlaceholder"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  old: !prev.old,
                                }))
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPasswords.old ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>
                          {errors.oldPassword && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.oldPassword}
                            </p>
                          )}
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            {t("profile.security.newPassword")} *
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.newPassword
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder={t(
                                "profile.security.newPasswordPlaceholder"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  new: !prev.new,
                                }))
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPasswords.new ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>
                          {errors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.newPassword}
                            </p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            {t("profile.security.confirmPassword")} *
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.confirmPassword
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder={t(
                                "profile.security.confirmPasswordPlaceholder"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPasswords((prev) => ({
                                  ...prev,
                                  confirm: !prev.confirm,
                                }))
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPasswords.confirm ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordChange(false);
                              setFormData((prev) => ({
                                ...prev,
                                oldPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              }));
                              setErrors({});
                            }}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {t("profile.cancel")}
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                          >
                            {saving ? (
                              <Loader size={20} className="animate-spin mr-2" />
                            ) : (
                              <Save size={20} className="mr-2" />
                            )}
                            {saving
                              ? t("profile.saving")
                              : t("profile.security.updatePassword")}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === "bookings" && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-gray-900">
                    {t("profile.tabs.bookings")}
                  </h2>

                  <div className="border border-gray-200 rounded-lg p-8 text-center">
                    <CreditCard
                      size={48}
                      className="mx-auto text-gray-400 mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("profile.bookings.title")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t("profile.bookings.description")}
                    </p>
                    <button
                      onClick={() => navigate("/my-tickets")}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t("profile.bookings.viewTickets")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
