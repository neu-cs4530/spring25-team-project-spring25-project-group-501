import axios from 'axios';
import { SafeDatabaseUser } from '../types/types';

const API_URL = process.env.REACT_APP_SERVER_URL;

// Define the Google credential response interface
export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  g_csrf_token: string;
}

/**
 * Initialize Google OAuth sign-in
 * @param clientId The Google OAuth client ID
 * @param callback Function to handle the credential response
 */
export const initializeGoogleAuth = (
  clientId: string,
  callback: (response: GoogleCredentialResponse) => void,
): void => {
  if (window.google && window.google.accounts) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback,
    });
  } else {
    throw new Error('Google OAuth is not available');
  }
};

/**
 * Render the Google sign-in button
 * @param elementId The ID of the HTML element to render the button in
 * @param theme The button theme ('outline' | 'filled')
 * @param size The button size ('large' | 'medium' | 'small')
 * @param shape The button shape ('rectangular' | 'pill' | 'circle' | 'square')
 */
export const renderGoogleButton = (
  elementId: string,
  theme: string = 'outline',
  size: string = 'large',
  shape: string = 'pill',
): void => {
  if (window.google && window.google.accounts) {
    window.google.accounts.id.renderButton(document.getElementById(elementId), {
      theme,
      size,
      shape,
    });
  } else {
    throw new Error('Google OAuth is not available');
  }
};

/**
 * Process Google OAuth login
 * @param credential The Google credential token
 * @returns Promise with the authenticated user
 */
export const processGoogleLogin = async (credential: string): Promise<SafeDatabaseUser> => {
  try {
    const result = await axios.post(`${API_URL}/user/google-login`, { credential });

    if (result.status !== 200) {
      throw new Error('Failed to authenticate with Google');
    }

    return result.data;
  } catch (error) {
    throw new Error('Failed to login with Google. Please try again.');
  }
};

// Type definition for Google on the window object
export interface GoogleAuthWindow extends Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
        }) => void;
        renderButton: (
          element: HTMLElement | null,
          options: { theme: string; size: string; shape: string },
        ) => void;
      };
    };
  };
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            options: { theme: string; size: string; shape: string },
          ) => void;
        };
      };
    };
  }
}
