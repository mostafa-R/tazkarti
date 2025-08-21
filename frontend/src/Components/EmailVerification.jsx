import { useState } from 'react';
import { authAPI } from '../services/api';

export default function EmailVerification({ email, userType = 'user', onVerificationSuccess, onBack }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyEmail(email, verificationCode);
      
      if (response.data) {
        alert('Email verified successfully! You can now login.');
        if (onVerificationSuccess) {
          onVerificationSuccess(userType);
        }
      }
    } catch (error) {
      console.error('Email verification error:', error);
      const errorMessage = error.response?.data?.error || 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    // Note: You might need to implement a resend endpoint in your backend
    alert('Resend functionality would be implemented here');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-semibold text-[#0052CC]">{email}</p>
      </div>

      <form onSubmit={handleVerification} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setVerificationCode(value);
              setError('');
            }}
            placeholder="Enter 6-digit code"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent text-center text-lg tracking-widest"
            maxLength={6}
            required
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || verificationCode.length !== 6}
          className="w-full bg-[#0052CC] hover:bg-[#003d99] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResendCode}
          className="text-[#0052CC] hover:underline text-sm font-medium"
        >
          Resend Code
        </button>
      </div>

      {onBack && (
        <div className="mt-4 text-center">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Registration
          </button>
        </div>
      )}
    </div>
  );
}
