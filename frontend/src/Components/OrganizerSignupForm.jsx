import { useState } from 'react';
import { Eye, EyeOff, Upload } from 'lucide-react';
import { authAPI } from '../services/api';

export default function OrganizerSignupForm({ onBack, onSignupSuccess }) {
  const [show, setShow] = useState({ pass: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [fields, setFields] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    country: 'Egypt', city: '', street: '', zip: '',
    orgName: '', orgDescription: '', bio: '',
    profileImage: null,
  });

  // Password strength checker (same as user form)
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    let strength = 'Very Weak';
    let color = 'bg-red-500';
    
    if (score >= 4) {
      strength = 'Strong';
      color = 'bg-green-500';
    } else if (score >= 3) {
      strength = 'Medium';
      color = 'bg-yellow-500';
    } else if (score >= 2) {
      strength = 'Weak';
      color = 'bg-orange-500';
    }
    
    return { checks, score, strength, color, percentage: (score / 5) * 100 };
  };

  const [passwordStrength, setPasswordStrength] = useState(checkPasswordStrength(''));
  const [fieldErrors, setFieldErrors] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    phone: '', country: '', city: '', street: '', zip: '',
    orgName: '', orgDescription: ''
  });

  // Validation patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^01[0-9]{9}$/;

  // Real-time field validation
  const validateField = (fieldName, value) => {
    let error = '';
    
    switch (fieldName) {
      case 'firstName':
        if (!value.trim()) {
          error = 'First name is required';
        } else if (value.trim().length < 3) {
          error = 'First name must be at least 3 characters';
        } else if (value.trim().length > 15) {
          error = 'First name must be no more than 15 characters';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          error = 'First name can only contain letters, numbers, underscores, and hyphens';
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          error = 'Last name is required';
        } else if (value.trim().length < 3) {
          error = 'Last name must be at least 3 characters';
        } else if (value.trim().length > 15) {
          error = 'Last name must be no more than 15 characters';
        } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          error = 'Last name can only contain letters, numbers, underscores, and hyphens';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else {
          const strength = checkPasswordStrength(value);
          if (strength.score < 3) {
            error = 'Password is too weak. Include uppercase, lowercase, numbers, and special characters';
          }
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== fields.password) {
          error = 'Passwords do not match';
        }
        break;
      case 'phone':
        if (value.trim() && !phoneRegex.test(value)) {
          error = 'Please enter a valid phone number (01xxxxxxxxx)';
        }
        break;
      case 'country':
        if (!value.trim()) {
          error = 'Country is required';
        }
        break;
      case 'city':
        if (!value.trim()) {
          error = 'City is required';
        }
        break;
      case 'street':
        if (!value.trim()) {
          error = 'Street is required';
        }
        break;
      case 'zip':
        if (!value.trim()) {
          error = 'ZIP code is required';
        }
        break;
      case 'orgName':
        if (!value.trim()) {
          error = 'Organization name is required';
        } else if (value.trim().length < 3) {
          error = 'Organization name must be at least 3 characters';
        }
        break;
      case 'orgDescription':
        if (!value.trim()) {
          error = 'Organization description is required';
        } else if (value.trim().length < 10) {
          error = 'Description must be at least 10 characters';
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    return error === '';
  };

  const onChange = (name, value) => {
    setFields(prev => ({ ...prev, [name]: value }));
    setTimeout(() => validateField(name, value), 300);
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'country', 'city', 'street', 'zip', 'orgName', 'orgDescription'];
    let hasErrors = false;
    
    for (const field of requiredFields) {
      if (!validateField(field, fields[field])) {
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      alert('Please fix all validation errors before submitting.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare data for backend API
      const organizerData = {
        firstName: fields.firstName,
        lastName: fields.lastName,
        email: fields.email,
        password: fields.password,
        confirmPassword: fields.confirmPassword,
        phone: fields.phone || undefined,
        organizationName: fields.orgName,
        organizationDescription: fields.orgDescription,
        bio: fields.bio || undefined,
        address: {
          country: fields.country,
          city: fields.city,
          street: fields.street,
          zip: fields.zip
        }
      };
      
      const response = await authAPI.registerOrganizer(organizerData);
      
      if (response.data) {
        alert('Registration successful! Please check your email for verification code.');
        // Call success callback with user email for verification
        if (onSignupSuccess) {
          onSignupSuccess(fields.email, 'organizer');
        }
      }
    } catch (error) {
      console.error('Organizer registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-[#0052CC] text-sm hover:underline">← Back to Role Selection</button>

      <form onSubmit={submit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedInput label="First Name" required value={fields.firstName} 
              onChange={v => onChange('firstName', v)} error={fieldErrors.firstName} />
            <ValidatedInput label="Last Name" required value={fields.lastName} 
              onChange={v => onChange('lastName', v)} error={fieldErrors.lastName} />
          </div>
          <ValidatedInput type="email" label="Email" required value={fields.email} 
            onChange={v => onChange('email', v)} error={fieldErrors.email} />
          <ValidatedInput label="Phone (optional)" value={fields.phone} 
            onChange={v => onChange('phone', v)} placeholder="01XXXXXXXXX" error={fieldErrors.phone} />
        </div>

        {/* Account Security */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Account Security</h4>
          
          {/* Password Field with Validation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={show.pass ? 'text' : 'password'}
                value={fields.password}
                onChange={(e) => {
                  const value = e.target.value;
                  onChange('password', value);
                  setPasswordStrength(checkPasswordStrength(value));
                }}
                placeholder="Enter password"
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, pass: !s.pass }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {show.pass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {fields.password && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Password Strength:</span>
                  <span className={`font-medium ${
                    passwordStrength.strength === 'Strong' ? 'text-green-600' :
                    passwordStrength.strength === 'Medium' ? 'text-yellow-600' :
                    passwordStrength.strength === 'Weak' ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {passwordStrength.strength}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.percentage}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  <div className="grid grid-cols-2 gap-1">
                    <span className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}>
                      ✓ 8+ characters
                    </span>
                    <span className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}>
                      ✓ Uppercase
                    </span>
                    <span className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}>
                      ✓ Lowercase
                    </span>
                    <span className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}>
                      ✓ Number
                    </span>
                    <span className={passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}>
                      ✓ Special char
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Confirm Password Field */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={show.confirm ? 'text' : 'password'}
                value={fields.confirmPassword}
                onChange={(e) => onChange('confirmPassword', e.target.value)}
                placeholder="Confirm password"
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {show.confirm ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {fields.confirmPassword && fields.password !== fields.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Address Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValidatedSelect label="Country" value={fields.country} onChange={v => onChange('country', v)}
              options={['Egypt','United Arab Emirates','Saudi Arabia','Jordan','Lebanon']} 
              required error={fieldErrors.country} />
            <ValidatedInput label="City" required value={fields.city} 
              onChange={v => onChange('city', v)} error={fieldErrors.city} />
            <ValidatedInput label="Street" required value={fields.street} 
              onChange={v => onChange('street', v)} error={fieldErrors.street} />
            <ValidatedInput label="ZIP Code" required value={fields.zip} 
              onChange={v => onChange('zip', v)} error={fieldErrors.zip} />
          </div>
        </div>

        {/* Organization */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Organization Information</h4>
          <ValidatedInput label="Organization Name" required value={fields.orgName} 
            onChange={v => onChange('orgName', v)} error={fieldErrors.orgName} />
          <ValidatedTextarea label="Organization Description" required maxLength={500}
            value={fields.orgDescription} onChange={v => onChange('orgDescription', v)} 
            error={fieldErrors.orgDescription} />
          <Textarea label="Bio (optional)" maxLength={300}
            value={fields.bio} onChange={v => onChange('bio', v)} />

        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0052CC] hover:bg-[#003d99] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up as Organizer'}
        </button>
      </form>
      
    </div>
  );
}

/* --- Small UI helpers (Inputs) --- */
function ValidatedInput({ label, value, onChange, type='text', placeholder='', required=false, error='' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : value && !error 
              ? 'border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:ring-blue-600'
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type='text', placeholder='', required=false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
      />
    </div>
  );
}

function Password({ label, value, onChange, show, toggle }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
          placeholder="Enter password"
          required
        />
        <button type="button" onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          {show ? <EyeOff size={16}/> : <Eye size={16}/>}
        </button>
      </div>
    </div>
  );
}

function ValidatedTextarea({ label, value, onChange, required=false, maxLength, placeholder='', error='' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none min-h-[96px] resize-vertical transition-all ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : value && !error 
              ? 'border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:ring-blue-600'
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {maxLength && <p className="text-xs text-gray-500 mt-1">Max {maxLength} characters</p>}
    </div>
  );
}

function Textarea({ label, value, onChange, required=false, maxLength, placeholder='' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent min-h-[96px] resize-vertical"
      />
      {maxLength && <p className="text-xs text-gray-500 mt-1">Max {maxLength} characters</p>}
    </div>
  );
}

function ValidatedSelect({ label, value, onChange, options, required=false, error='' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : value && !error 
              ? 'border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:ring-blue-600'
        }`}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options, required=false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
