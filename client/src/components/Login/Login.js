import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './Login.css';
import Popup from '../Popup/Popup';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Hook for navigation
  const [activePolicy, setActivePolicy] = useState(null);


  const handleLogin = async (e) => {
    e.preventDefault();
    try{
    // Dynamically use the API base URL
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
      email,
      password,
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      navigate('/home');  // Redirect to the dashboard after login
    }
  } catch (err) {
    // Customize error handling
    if (err.response && err.response.data.message) {
      if (err.response.data.message === 'Account not verified. Please check your email for the verification link.') {
        setError('Your account is not verified. Please check your email for the verification link.');
      } else {
        setError('Invalid email or password');
      }
    } else {
      setError('An error occurred. Please try again.');
    }
  }
};

const handleContinueAsGuest = () => {
  navigate('/guest'); // Redirect to the guest home page
};

// Functions to open and close the popup
const openPolicy = (policy) => {
  setActivePolicy(policy); // Set the active policy popup
};

const closePolicy = () => {
  setActivePolicy(null); // Close the popup
};
return (
  <>
    {/* Policy Links */}
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

    {/* Login Page */}
    <div className="login-page">
      <div className="login-intro">
        <h2>Welcome to Destination Europe!</h2>
        <p>
          Uncover Europe's most captivating destinations! Whether you're seeking historical landmarks or scenic landscapes, this platform helps you explore and learn about Europe's rich heritage and diverse locations.
        </p>
      </div>

      <div className="login-container">
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleLogin}>
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
            <button type="submit">Login</button>
          </div>
        </form>

        <label>
          Don't have an account? <a href="/signup">Sign up</a>
        </label>
        <div className="guest-access">
          <p>OR</p>
          <button onClick={handleContinueAsGuest}>Continue as Guest</button>
        </div>
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

export default Login;
