/* eslint-disable @typescript-eslint/no-explicit-any */

import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import Header from "@/layout/Header";
import { revokeToken } from "@/lib/auth";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// TypeScript type declarations for chrome.identity
declare const chrome: any;

function GoogleLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Function to initiate the login process by getting the Google token
  const handleLogin = () => {
    getToken(true);
  };

  // Function to retrieve the auth token from Chrome identity API
  const getToken = (interactive: boolean) => {
    try {
      chrome.identity.getAuthToken({ interactive }, (token: string) => {
        if (chrome.runtime.lastError) {
          console.error(`${chrome.runtime.lastError} - ${token}`);
        } else {
          loginWithGoogle(token);
        }
      });
    } catch (error) {
      console.error("Error getting token:", error);
    }
  };

  // Function to log in with the Google token
  const loginWithGoogle = async (token: string) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { token }
      );

      if (response.status === 200) {
        const user = response.data;
        login({
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          googleToken: token,
          googleId: user.googleId,
          ssToken: user.ssToken,
        });
        setLoading(false);
        navigate("/chatbox");
        window.location.hash = "#/chatbox";
      } else {
        setLoading(false);
        console.error("Login failed:", response.data.message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error logging in:", error);
      // Remove token on error and optionally revoke it
      chrome.identity.removeCachedAuthToken({ token }, () => {
        console.log("Token cleared.");
        revokeToken(token);
      });
    }
  };

  // Effect hook to automatically fetch token on mount (non-interactive)
  useEffect(() => {
    getToken(false);
  }, []); // Empty dependency array ensures this only runs on mount

  return (
    <div>
      <Header />
      {loading ? (
        <div className="pt-14 flex justify-center">
          <Spinner className="" /> Loading...
        </div>
      ) : (
        <div className="max-h-[80] px-3 flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm mx-10">
            <img
              src="/assets/cover.jpeg"
              alt="Logo"
              className="w-90 h-90 mx-auto mb-4"
            />
            <h1 className="text-2xl text-center text-gray-700 mb-4 font-sans">
              Smart Summarize
            </h1>
            <p className="text-center text-gray-500 mb-6">
              Sign in with your Google account to continue.
            </p>
            <button
              onClick={handleLogin}
              className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
            >
              <img
                src="https://cdn-teams-slug.flaticon.com/google.jpg"
                alt="Google logo"
                className="w-6 h-6 mr-2"
              />
              Continue with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleLogin;
