import React, { useEffect } from 'react';
import Login from './components/Login/Login'; // Import Login component
import { Route, Routes } from 'react-router-dom'; // Import necessary components for routing
import Signup from './components/SignUp/Signup';
import Verify from './components/Verify/Verify';
import Guest from './components/GuestPage/Guest';
import HomePage from './components/HomePage/HomePage';


const App = () => {
  useEffect(() => {
    document.title = 'Destination Europe';
  }, []);

  return (
    <div>
      <Routes>
        {/* Make the Login page the default (root) route */}
        <Route path="/" element={<Login />} />  {/* This will load the Login component for '/' */}
        <Route path="/login" element={<Login />} /> {/* You can still use the /login route */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/home" element={<HomePage />} />
        {/* Define more routes as necessary */}
      </Routes>
    </div>
  );
}

export default App;
