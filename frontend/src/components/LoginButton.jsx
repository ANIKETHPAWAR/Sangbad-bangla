import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import "./LoginButton.css";

const LoginButton = () => {
  try {
    const { loginWithRedirect } = useAuth0();

    return (
      <button 
        className="login-button"
        onClick={() => loginWithRedirect()}
      >
        Sign In
      </button>
    );
  } catch (error) {
    // Fallback when Auth0 is not available
    return (
      <button 
        className="login-button"
        onClick={() => console.log('Auth0 not configured')}
      >
        Sign In
      </button>
    );
  }
};

export default LoginButton;
