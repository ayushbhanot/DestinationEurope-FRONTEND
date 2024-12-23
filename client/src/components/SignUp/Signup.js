import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './Signup.css'; // Import the updated CSS
import Popup from '../Popup/Popup';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const navigate = useNavigate(); // Hook for navigation
  const [activePolicy, setActivePolicy] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Ensure the fields have values
    if (!email || !password || !name) {
        setError('All fields are required');
        return;
    }

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/signup`, {
            name,      // name, email, and password should be set in your state
            email,
            password,
        });

        // Handle success, such as displaying a success message or redirecting
        if (response.status === 200) {
            alert('Account created successfully! Please check your email for verification.');
            setEmailSent(true);
        }
      } catch (err) {
        // Catch and log errors
        console.error('Error during signup:', err.response?.data || err);
  
        // Customize error handling based on backend error messages
        if (err.response?.data?.message) {
            if (err.response.data.message === 'User already exists') {
                setError('An account with this email already exists. Please log in.');
            } else if (err.response.data.message === 'User exists but is not verified. Please check your email for verification.') {
                setError('An account with this email exists but is not yet verified. Please check your inbox for the verification email or click the "Resend Verification Email" button.');
                setEmailSent(true);
            } else {
                setError(err.response.data.message); // Generic message from the backend
            }
        } else {
            setError('Signup failed. Please try again later.');
        }
    }
  };

const openPolicy = (policy) => {
  setActivePolicy(policy); // Set the active policy popup
};

const closePolicy = () => {
  setActivePolicy(null); // Close the popup
};

const handleResendVerification = async () => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/resend-verification`, { email });

    if (response.status === 200) {
      alert('Verification email resent!');
    }
  } catch (err) {
    console.error('Error resending verification email:', err.response?.data || err);
    alert('Failed to resend verification email.');
  }
};


  return (
    <>
    <div className="policy-container">
  <button className="policy-link" onClick={() => openPolicy('security')}>
    Security Policy
  </button>
  <button className="policy-link" onClick={() => openPolicy('privacy')}>
    Privacy Policy
  </button>
  <button className="policy-link" onClick={() => openPolicy('dmca')}>
    DMCA Policy
  </button>
</div>
    <div className="signup-page">
      <div className="signup-intro">
        <h2>Join Destination Europe!</h2>
        <p>Create an account to explore Europe’s best destinations and share your favorite places.</p>
      </div>

      <div
      className="signup-container"
      style={{ position: 'relative', top: emailSent ? '-50px' : '0px' }}
      >
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <button type="submit">Sign Up</button>
          </div>
        </form>

        {emailSent && (
          <div className="resend-verification">
            <p style={{color: '#4CAF50;'}}>If you did not receive the verification email, you can resend it:</p>
            <button onClick={handleResendVerification}>Resend Verification Email</button>
          </div>
        )}

        <label>
          Already have an account? <a href="/login">Login</a>
        </label>
      </div>
    </div>
    {/* Popups for Policies */}
{activePolicy === 'security' && (
  <Popup isVisible={true} onClose={closePolicy}>
    <h2 className="popup-title">Security Policy</h2>
    <p>
      At <strong>Destination Europe</strong>, safeguarding your information is our utmost priority. This policy outlines our commitment to maintaining the security of your data and ensuring a safe experience on our platform.
    </p>
    <ul>
      <li>
        <strong>Data Encryption:</strong> All sensitive data exchanged between your browser and our servers is secured using SSL encryption.
      </li>
      <li>
        <strong>Secure Authentication:</strong> We hash all passwords with advanced algorithms like Bcrypt. Two-factor authentication (2FA) is available for added security.
      </li>
      <li>
        <strong>Regular Audits:</strong> Our team performs regular vulnerability assessments and system audits to prevent potential breaches.
      </li>
      <li>
        <strong>Access Controls:</strong> Data access is limited to authorized personnel only and monitored through robust access control policies.
      </li>
      <li>
        <strong>Incident Management:</strong> In the event of a security breach, our team will notify affected users and take remedial action within 72 hours.
      </li>
    </ul>
    <p>
      For any security-related concerns, please contact us at{' '}
      <a href="mailto:ayushbhanot1010@gmail.com">ayushbhanot1010@gmail.com</a>.
    </p>
  </Popup>
)}

{activePolicy === 'privacy' && (
  <Popup isVisible={true} onClose={closePolicy}>
    <h2 className="popup-title">Privacy Policy</h2>
    <p>
      <strong>Destination Europe</strong> is committed to protecting your privacy. This policy explains how we handle your data, ensuring it is used responsibly and securely.
    </p>
    <ul>
      <li>
        <strong>What We Collect:</strong> We collect personal information such as your email, nickname, and password to create and manage your account.
      </li>
      <li>
        <strong>How We Use Your Data:</strong> Your data is used to provide personalized services, enhance security, and improve your experience on the platform.
      </li>
      <li>
        <strong>Data Sharing:</strong> We do not sell or share your data with third parties unless required by law or necessary for platform operation.
      </li>
      <li>
        <strong>Data Retention:</strong> We retain your data as long as needed to provide our services. You may request data deletion at any time.
      </li>
      <li>
        <strong>Your Rights:</strong> You can access, update, or delete your data through your account settings.
      </li>
    </ul>
    <p>
      For privacy-related inquiries, contact us at{' '}
      <a href="mailto:ayushbhanot1010@gmail.com">ayushbhanot1010@gmail.com</a>.
    </p>
  </Popup>
)}

{activePolicy === 'dmca' && (
  <Popup isVisible={true} onClose={closePolicy}>
    <h2 className="popup-title">DMCA Notice & Takedown Policy</h2>
    <p>
      <strong>Destination Europe</strong> respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). If you believe your copyrighted material has been used without permission, please follow the steps below:
    </p>
    <ul>
      <li>
        <strong>Submit a Takedown Request:</strong> Email{' '}
        <a href="mailto:ayushbhanot1010@gmail.com">ayushbhanot1010@gmail.com</a> with:
        <ul>
          <li>Identification of the copyrighted material.</li>
          <li>The URL of the infringing content.</li>
          <li>Your contact information (name, email, phone).</li>
          <li>A good-faith statement asserting the use is unauthorized.</li>
        </ul>
      </li>
      <li>
        <strong>Action Upon Notification:</strong> Once we receive your request, we will:
        <ul>
          <li>Investigate and remove the infringing content if the claim is valid.</li>
          <li>Notify the user responsible for the content.</li>
        </ul>
      </li>
      <li>
        <strong>Counter-Notification:</strong> If you believe the takedown was a mistake, you may submit a counter-notification with:
        <ul>
          <li>Your contact information.</li>
          <li>Details of the content and reasons for reinstatement.</li>
        </ul>
      </li>
      <li>
        <strong>Repeat Infringers:</strong> Accounts repeatedly violating copyright policies will be terminated.
      </li>
    </ul>
    <p>
      For DMCA-related concerns, email us at{' '}
      <a href="mailto:ayushbhanot1010@gmail.com">ayushbhanot1010@gmail.com</a>.
    </p>
  </Popup>
)}

    </>
  );
};

export default Signup;
