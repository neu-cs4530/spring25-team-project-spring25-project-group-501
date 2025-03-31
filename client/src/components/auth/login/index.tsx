import React, { useEffect } from 'react';
import './index.css';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useLoginContext from '../../../hooks/useLoginContext';
import {
  GoogleCredentialResponse,
  initializeGoogleAuth,
  renderGoogleButton,
  processGoogleLogin,
} from '../../../services/googleAuthService';

/**
 * Renders a login form with username and password inputs, password visibility toggle,
 * error handling, and a link to the signup page.
 */
const Login = () => {
  const {
    username,
    password,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
  } = useAuth('login');
  const { setUser } = useLoginContext();
  const navigate = useNavigate();

  // Initialize Google OAuth
  useEffect(() => {
    const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
      try {
        // Process the Google login using our service
        const user = await processGoogleLogin(response.credential);

        setUser(user);

        navigate('/home');
      } catch (error) {
        throw new Error(`Error processing Google login: ${error}`);
      }
    };

    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

    if (clientId) {
      initializeGoogleAuth(clientId, handleCredentialResponse);

      renderGoogleButton('google-signin-button');
    } else {
      throw new Error('Google client ID not found');
    }
  }, [navigate, setUser]);

  return (
    <div className='container'>
      <h2>Welcome to FakeStackOverflow!</h2>
      <h3>Please login to continue.</h3>
      <form onSubmit={handleSubmit}>
        <h4>Please enter your username.</h4>
        <input
          type='text'
          value={username}
          onChange={event => handleInputChange(event, 'username')}
          placeholder='Enter your username'
          required
          className='input-text'
          id='username-input'
        />
        <h4>Please enter your password.</h4>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={event => handleInputChange(event, 'password')}
          placeholder='Enter your password'
          required
          className='input-text'
          id='password-input'
        />
        <div className='show-password'>
          <input
            type='checkbox'
            id='showPasswordToggle'
            checked={showPassword}
            onChange={togglePasswordVisibility}
          />
          <label htmlFor='showPasswordToggle'>Show Password</label>
        </div>
        <button type='submit' className='login-button'>
          Submit
        </button>
      </form>
      <div className='oauth-container'>
        <p>Or sign in with:</p>
        <div id='google-signin-button'></div>
      </div>
      {err && <p className='error-message'>{err}</p>}
      <Link to='/signup' className='signup-link'>
        Don&apos;t have an account? Sign up here.
      </Link>
    </div>
  );
};

export default Login;
