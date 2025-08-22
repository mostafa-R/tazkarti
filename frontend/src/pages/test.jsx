import React, { useState } from 'react';
import { User, Calendar, Eye, EyeOff, Upload, ArrowLeft, Check, X } from 'lucide-react';

const TazkartiSignup = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({});
  const [formData, setFormData] = useState({
    user: {
      firstName: '',
      lastName: '',
      email: 'Mariam.Mahmoud@gmail.com',
      phone: '',
      country: '',
      city: '',
      street: '',
      zip: '',
      password: '',
      confirmPassword: ''
    },
    organizer: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      country: '',
      city: '',
      street: '',
      zip: '',
      orgName: '',
      orgDescription: '',
      bio: '',
      profileImage: null
    }
  });

  const togglePassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const checkPasswordStrength = (password, type) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const strength = Object.values(checks).filter(Boolean).length;
    let strengthLevel = 'weak';
    if (strength >= 4) strengthLevel = 'strong';
    else if (strength >= 2) strengthLevel = 'medium';

    setPasswordStrength(prev => ({
      ...prev,
      [type]: { checks, strengthLevel, strength }
    }));
  };

  const handleInputChange = (role, field, value) => {
    setFormData(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value
      }
    }));

    if (field === 'password') {
      checkPasswordStrength(value, role);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleInputChange('organizer', 'profileImage', file);
    }
  };

  const handleSubmit = (e, role) => {
    e.preventDefault();
    console.log(`${role} form submitted:`, formData[role]);
    alert(`${role} signup form submitted! (This is a demo)`);
  };

  const resetToRoleSelection = () => {
    setSelectedRole('');
  };

  const PasswordStrengthIndicator = ({ strength, type }) => {
    if (!strength) return null;

    const { checks, strengthLevel } = strength;
    const strengthColors = {
      weak: 'bg-red-500',
      medium: 'bg-yellow-500',
      strong: 'bg-green-500'
    };

    return (
      <div className="mt-2">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div className={`h-full transition-all duration-300 rounded-full ${strengthColors[strengthLevel]} ${
            strengthLevel === 'strong' ? 'w-full' : strengthLevel === 'medium' ? 'w-2/3' : 'w-1/3'
          }`}></div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(checks).map(([key, met]) => (
            <div key={key} className={`flex items-center gap-1 ${met ? 'text-green-600' : 'text-gray-400'}`}>
              {met ? <Check size={10} /> : <X size={10} />}
              <span>
                {key === 'length' && '8+ characters'}
                {key === 'uppercase' && 'Uppercase'}
                {key === 'lowercase' && 'Lowercase'}
                {key === 'number' && 'Number'}
                {key === 'special' && 'Special char'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RoleSelection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Choose Your Role</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setSelectedRole('user')}
          className="border-2 border-gray-200 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-blue-600 hover:bg-blue-50 group"
        >
          <User className="mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" size={32} />
          <h4 className="font-semibold text-gray-900 mb-1">User</h4>
          <p className="text-gray-600 text-sm">Ticket Buyer</p>
        </div>
        <div
          onClick={() => setSelectedRole('organizer')}
          className="border-2 border-gray-200 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-blue-600 hover:bg-blue-50 group"
        >
          <Calendar className="mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" size={32} />
          <h4 className="font-semibold text-gray-900 mb-1">Organizer</h4>
          <p className="text-gray-600 text-sm">Event Host</p>
        </div>
      </div>
    </div>
  );

  const UserForm = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <button
        onClick={resetToRoleSelection}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to Role Selection
      </button>

      <form onSubmit={(e) => handleSubmit(e, 'user')} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.user.firstName}
                onChange={(e) => handleInputChange('user', 'firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your first name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.user.lastName}
                onChange={(e) => handleInputChange('user', 'lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.user.phone}
              onChange={(e) => handleInputChange('user', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Address Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={formData.user.country}
                onChange={(e) => handleInputChange('user', 'country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.user.city}
                onChange={(e) => handleInputChange('user', 'city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your city"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
              <input
                type="text"
                value={formData.user.street}
                onChange={(e) => handleInputChange('user', 'street', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your street"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
              <input
                type="text"
                value={formData.user.zip}
                onChange={(e) => handleInputChange('user', 'zip', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your ZIP"
              />
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Account Security
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.user.email}
              onChange={(e) => handleInputChange('user', 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.userPassword ? "text" : "password"}
                value={formData.user.password}
                onChange={(e) => handleInputChange('user', 'password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('userPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.userPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrengthIndicator strength={passwordStrength.user} type="user" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.userConfirmPassword ? "text" : "password"}
                value={formData.user.confirmPassword}
                onChange={(e) => handleInputChange('user', 'confirmPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('userConfirmPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.userConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="space-y-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Register
          </button>
          <button
            type="button"
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              Login
            </a>
          </div>
          <div className="text-center text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </form>
    </div>
  );

  const OrganizerForm = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <button
        onClick={resetToRoleSelection}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to Role Selection
      </button>

      <form onSubmit={(e) => handleSubmit(e, 'organizer')} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.organizer.firstName}
                onChange={(e) => handleInputChange('organizer', 'firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your first name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.organizer.lastName}
                onChange={(e) => handleInputChange('organizer', 'lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.organizer.email}
              onChange={(e) => handleInputChange('organizer', 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your email address"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.organizer.phone}
              onChange={(e) => handleInputChange('organizer', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        {/* Account Security */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Account Security
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.orgPassword ? "text" : "password"}
                value={formData.organizer.password}
                onChange={(e) => handleInputChange('organizer', 'password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('orgPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.orgPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrengthIndicator strength={passwordStrength.organizer} type="organizer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.orgConfirmPassword ? "text" : "password"}
                value={formData.organizer.confirmPassword}
                onChange={(e) => handleInputChange('organizer', 'confirmPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('orgConfirmPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.orgConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Address Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.organizer.country}
                onChange={(e) => handleInputChange('organizer', 'country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                <option value="">Select Country</option>
                <option value="egypt">Egypt</option>
                <option value="uae">United Arab Emirates</option>
                <option value="saudi">Saudi Arabia</option>
                <option value="jordan">Jordan</option>
                <option value="lebanon">Lebanon</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.organizer.city}
                onChange={(e) => handleInputChange('organizer', 'city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your city"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.organizer.street}
                onChange={(e) => handleInputChange('organizer', 'street', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your street address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.organizer.zip}
                onChange={(e) => handleInputChange('organizer', 'zip', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter ZIP code"
                required
              />
            </div>
          </div>
        </div>

        {/* Organization Information */}
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900 pb-2 border-b border-gray-200">
            Organization Information
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.organizer.orgName}
              onChange={(e) => handleInputChange('organizer', 'orgName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter organization name (3-100 characters)"
              minLength={3}
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Must be between 3-100 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.organizer.orgDescription}
              onChange={(e) => handleInputChange('organizer', 'orgDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical min-h-[80px]"
              placeholder="Describe your organization and the types of events you host..."
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Up to 500 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Personal Bio</label>
            <textarea
              value={formData.organizer.bio}
              onChange={(e) => handleInputChange('organizer', 'bio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical min-h-[80px]"
              placeholder="Tell us about yourself as an event organizer..."
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">Up to 300 characters (optional)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
            <div
              onClick={() => document.getElementById('profileImageInput').click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Upload className="mx-auto mb-2 text-blue-600" size={24} />
              <p className="text-sm">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              {formData.organizer.profileImage && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ File selected: {formData.organizer.profileImage.name}
                </p>
              )}
            </div>
            <input
              type="file"
              id="profileImageInput"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-1">Optional - Upload your organization logo or profile picture</p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="space-y-4">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Sign Up as Organizer
          </button>
          <button
            type="button"
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
              Login
            </a>
          </div>
          <div className="text-center text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </form>
    </div>
  );

  const getHeaderSubtitle = () => {
    if (selectedRole === 'user') return 'Create an account to book your tickets';
    if (selectedRole === 'organizer') return 'Create your organizer account to start hosting events';
    return 'Join as a User or Organizer to start your journey';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white text-blue-600 p-3 rounded-xl">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22,10V6a2,2,0,0,0-2-2H4A2,2,0,0,0,2,6v4H3a3,3,0,0,1,0,6H2v4a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V16H21a3,3,0,0,1,0-6ZM20,8.5H14a.5.5,0,0,0-.5.5v6a.5.5,0,0,0,.5.5H20Z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold">Tazkarti</h1>
          </div>
          <p className="text-blue-100 opacity-90">{getHeaderSubtitle()}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {!selectedRole && <RoleSelection />}
          {selectedRole === 'user' && <UserForm />}
          {selectedRole === 'organizer' && <OrganizerForm />}
        </div>
      </div>
    </div>
  );
};

export default TazkartiSignup