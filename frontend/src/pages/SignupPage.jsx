import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailVerification from "../Components/EmailVerification.jsx";
import OrganizerSignupForm from "../Components/OrganizerSignupForm.jsx";
import RoleSelector from "../Components/RoleSelector.jsx";
import UserSignupForm from "./Signup.jsx";

export default function SignupPage() {
  const [role, setRole] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();

  const handleSignupSuccess = (email, type) => {
    setUserEmail(email);
    setUserType(type);
    setShowVerification(true);
  };

  const handleVerificationSuccess = () => {
    setShowVerification(false);
    // Navigate to login page after successful verification
    navigate("/login");
  };

  const handleBackToSignup = () => {
    setShowVerification(false);
    setUserEmail("");
    setUserType("");
  };

  // Title for the page (displayed in header)
  const subtitle = !role
    ? "Join as a User or Organizer to start your journey"
    : role === "user"
    ? "Create an account to book your tickets"
    : "Create your organizer account to start hosting events";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0052CC] to-[#003d99] text-white p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-white text-[#0052CC] p-3 rounded-xl">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v13a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a2 2 0 0 0-2-2Zm0 15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V10h14v9Zm0-11H5V6h14v2Z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">Tazkarti</h1>
          </div>
          <p className="opacity-90">{subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {showVerification ? (
            <EmailVerification
              email={userEmail}
              userType={userType}
              onVerificationSuccess={handleVerificationSuccess}
              onBack={handleBackToSignup}
            />
          ) : (
            <>
              {!role && <RoleSelector selectedRole={role} onSelect={setRole} />}

              {role === "user" && (
                <div className="space-y-6">
                  <button
                    onClick={() => setRole("")}
                    className="text-[#0052CC] text-sm hover:underline"
                  >
                    ← Back to Role Selection
                  </button>
                  <UserSignupForm onSignupSuccess={handleSignupSuccess} />
                </div>
              )}

              {role === "organizer" && (
                <OrganizerSignupForm
                  onBack={() => setRole("")}
                  onSignupSuccess={handleSignupSuccess}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
