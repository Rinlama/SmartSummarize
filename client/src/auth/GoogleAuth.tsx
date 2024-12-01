/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import Header from "@/layout/Header";
import { revokeToken } from "@/lib/auth";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

declare const chrome: any;

function GoogleLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    getToken(true);
  };

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

  const loginWithGoogle = async (token: string) => {
    setLoading(true);
    try {
      // Send the Google ID token to the backend for verification and user login/creation
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          token, // Send the Google ID token as part of the request body
        },
      );

      // Handle the response from the server
      if (response.status === 200) {
        const user = response.data;
        console.log("Login successful:", user);
        login({
          email: "sdf",
          name: "sdf",
          picture: "sdf",
          token,
        });
        setLoading(false);
        console.log("Navigating to /home");
        navigate("/home");
        window.location.hash = "#/home";
      } else {
        console.error("Login failed:", response.data.message);
      }
    } catch (error) {
      chrome.identity.removeCachedAuthToken({ token }, () => {
        console.log("Token cleared.");
        revokeTokenCalled(token); // Optional: Revoke the token from Google
      });
      console.error("Error logging in:", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const validateToken = async (token: string) => {
  //   try {
  //     const response = await fetch(
  //       `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
  //     );
  //     const data = await response.json();

  //     if (data.error === "invalid_token") {
  //       // Remove the cached token
  //       chrome.identity.removeCachedAuthToken({ token }, () => {
  //         console.log("Token cleared.");
  //         revokeToken(token); // Optional: Revoke the token from Google
  //       });
  //       return;
  //     }
  //     userInfo(token);
  //   } catch (error) {
  //     console.error("Error validating token:", error);
  //     setLoading(false);
  //     console.error("Error verifying token:", error);
  //   }
  // };

  const revokeTokenCalled = async (token: string) => revokeToken(token);

  // const userInfo = async (token: string) => {
  //   try {
  //     const response = await fetch(
  //       "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       },
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch user info.");
  //     }

  //     const userData = await response.json();
  //     login({
  //       email: userData.email,
  //       name: userData.name,
  //       picture: userData.picture,
  //     });
  //     setLoading(false);
  //     navigate("/home");
  //   } catch (error) {
  //     setLoading(false);
  //     console.error("Error fetching user info:", error);
  //   }
  // };

  useEffect(() => {
    getToken(false);
  }, [navigate]);

  return (
    <div>
      <Header />
      {loading ? (
        <div className="pt-14">
          {" "}
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
