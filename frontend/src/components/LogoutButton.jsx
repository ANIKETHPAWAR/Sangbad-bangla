import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import "./LogoutButton.css";

const LogoutButton = () => {
  const { logout } = useAuth0();

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
