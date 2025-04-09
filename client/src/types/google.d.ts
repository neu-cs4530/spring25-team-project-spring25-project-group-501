// Define the Google credential response interface
export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  g_csrf_token: string;
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
