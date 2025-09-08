import PropTypes from 'prop-types';
import React from 'react';

const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  icon: Icon,
  required = false,
  className = "",
  ...rest
}) => {
  const getInputStyles = () => {
    let baseStyles = "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ";
    
    if (error) {
      return baseStyles + "border-red-500 focus:ring-red-500";
    } else if (value && !error) {
      return baseStyles + "border-green-500 focus:ring-green-500";
    } else {
      return baseStyles + "border-gray-300 focus:ring-blue-500";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={getInputStyles()}
          {...rest}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.elementType,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default FormInput;
