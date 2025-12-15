import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import "./LoginButton.css";

const LoginButton = () => {
  // Safe Auth0 hook usage with fallback
  let loginWithRedirect = () => {};
  
  try {
    const auth0 = useAuth0();
    loginWithRedirect = auth0.loginWithRedirect;
  } catch (error) {
    console.warn('Auth0 not available in LoginButton:', error);
  }

  return (
    <button 
      className="login-button"
      onClick={() => loginWithRedirect()}
    >
      Sign In
    </button>
  );
};

export default LoginButton;
