import { ArrowLeft } from 'lucide-react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

const BackButton = ({ 
  onClick, 
  text, 
  className = "",
  showIcon = true 
}) => {
  const { t } = useTranslation();
  const buttonText = text || t("booking.backButton");

  return (
    <div className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <button
          onClick={onClick}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
          aria-label={buttonText}
        >
          {showIcon && <ArrowLeft className="w-5 h-5 mr-2" />}
          {buttonText}
        </button>
      </div>
    </div>
  );
};

BackButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string,
  className: PropTypes.string,
  showIcon: PropTypes.bool,
};

export default BackButton;
