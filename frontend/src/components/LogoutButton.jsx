import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import "./LogoutButton.css";

const LogoutButton = () => {
  try {
    const { logout } = useAuth0();

    return (
      <button 
        className="logout-button"
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      >
        লগআউট
      </button>
    );
  } catch (error) {
    // Fallback when Auth0 is not available
    return (
      <button 
        className="logout-button"
        onClick={() => console.log('Auth0 not configured')}
      >
        লগআউট
      </button>
    );
  }
};

export default LogoutButton;
