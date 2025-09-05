import { useState } from 'react';
import { json } from 'stream/consumers';

// --- Helper Components ---

// A simple loading spinner component
const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// Icon for the submit button
const ArrowIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
    </svg>
);


// --- Main Login Component ---

export default function VonageLogin() {
  // --- State Management ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [requestId, setRequestId] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone_input'); // 'phone_input', 'code_input', 'success', 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // --- API Call Handlers ---

  /**
   * Handles sending the verification code to the user's phone number.
   * It calls our backend API endpoint '/api/send-verification'.
   */
  const handleSendVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phoneNumber) {
        setMessage('Please enter a phone number.');
        return;
    }
    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();

      if (res.status === 200) {
        setRequestId(data.requestId);
        setStep('code_input'); // Move to the next step
        setMessage('A verification code has been sent to your phone.');
      } else {
        throw new Error(data.message || 'Failed to send verification code.');
      }
    } catch (error) {
      console.error('Verification send error:', error);
      setStep('error');
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('An unknown error occurred while sending the code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles checking the verification code entered by the user.
   * It calls our backend API endpoint '/api/check-verification'.
   */
const handleCheckVerification = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!code) {
    setMessage('Please enter the verification code.');
    return;
  }
  setIsLoading(true);
  setMessage('');

  try {
    const res = await fetch('/api/check-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, code }),
    });

    // Parse body once
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Use message from server if present
      const errorMessage = body?.message || `Error: ${res.status} ${res.statusText}`;
      throw new Error(errorMessage);
    }

    // Success
    setStep('success');
    setMessage(body.message || 'Login successful! Redirecting...');
  } catch (error) {
    console.error('Verification check error:', error);
    if (error instanceof Error) {
      setMessage(error.message);
    } else {
      setMessage('An unknown error occurred during verification.');
    }
  } finally {
    setIsLoading(false);
  }
};

  // --- Render Logic ---

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">

        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Secure Login</h1>
            <p className="text-gray-500 mt-2">
                {step === 'phone_input' ? 'Enter your phone number to get a code.' : 'Enter the code you received.'}
            </p>
        </div>

        {/* --- Phone Number Input Form --- */}
        {step === 'phone_input' && (
          <form onSubmit={handleSendVerification} className="space-y-4">
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 14155552671"
                className="w-full px-4 py-3 text-lg text-gray-700 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 transition"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : 'Send Code'}
            </button>
          </form>
        )}

        {/* --- Verification Code Input Form --- */}
        {step === 'code_input' && (
           <form onSubmit={handleCheckVerification} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 4-digit code"
                className="w-full px-4 py-3 text-lg text-gray-700 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400 transition"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : 'Verify & Login'}
            </button>
          </form>
        )}
        
        {/* --- Success State --- */}
        {step === 'success' && (
            <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg">
                <p>{message}</p>
            </div>
        )}

        {/* --- Error State --- */}
         {step === 'error' && (
            <div className="text-center p-4 bg-red-100 text-red-800 rounded-lg">
                <p>{message}</p>
                <button 
                    onClick={() => { setStep('phone_input'); setMessage(''); setPhoneNumber(''); setCode(''); }}
                    className="mt-2 text-blue-600 hover:underline"
                >
                    Try Again
                </button>
            </div>
        )}

        {/* Display non-blocking messages */}
        {message && (step === 'phone_input' || step === 'code_input') && (
            <p className="text-center text-sm text-gray-600">{message}</p>
        )}

      </div>
       <footer className="text-center mt-8 text-gray-500">
            <p>Powered by Vonage Verify API</p>
        </footer>
    </div>
  );
}