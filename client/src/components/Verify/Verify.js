import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Verify.css'; // Import the CSS for the page

const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // Use state to manage status dynamically
  const [message, setMessage] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get('status'); // Get 'status' query parameter
    setStatus(statusParam);

    // Update message based on the status
    if (statusParam === 'success') {
      setMessage('Your account has been successfully verified! You can now log in.');
    } else if (statusParam === 'error') {
      setMessage(
        'The verification link is invalid or has expired. Please try signing up again or contact support.'
      );
    }
  }, [location.search]);

  return (
    <div className="verify-page">
      <div className="verify-intro">
        {status === 'success' ? (
          <>
            <h2 className="verified-header">✔️ Verification Successful</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/login')}>Go to Login</button>
          </>
        ) : (
          <>
            <h2 className="rejected-header">❌ Verification Failed</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/signup')}>Go to Signup</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;


/* OLD FILE

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Verify.css'; // Import the CSS for the page

const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get('status'); // Get 'status' query parameter

  return (
    <div className="verify-page">
      <div className="verify-intro">
        {status === 'success' ? (
          <>
            <h2 className="verified-header">✔️ Verification Successful</h2>
            <p>Your account has been successfully verified! You can now log in.</p>
            <button onClick={() => navigate('/login')}>Go to Login</button>
          </>
        ) : (
          <>
            <h2 className="rejected-header">❌ Verification Failed</h2>
            <p>The verification link is invalid or has expired. Please try signing up again or contact support.</p>
            <button onClick={() => navigate('/signup')}>Go to Signup</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;
*/