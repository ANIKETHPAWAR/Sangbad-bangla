import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import "./LogoutButton.css";

const LogoutButton = () => {
  // Safe Auth0 hook usage with fallback
  let logout = () => console.log('Auth0 not configured');
  
  try {
    const auth0 = useAuth0();
    logout = auth0.logout;
  } catch (error) {
    console.warn('Auth0 not available in LogoutButton:', error);
  }

  return (
    <button 
      className="logout-button"
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
    >
      লগআউট
    </button>
  );
};

export default LogoutButton;
