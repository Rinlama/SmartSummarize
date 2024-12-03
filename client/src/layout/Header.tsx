/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import AlertTemplate from "@/components/alert/AlertTemplate";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useAlertMessage } from "@/context/AlertMessageContext";
import { useAuth } from "@/context/AuthContext";
import { revokeToken } from "@/lib/auth";
import { CircleUser, LogOut, Settings } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// TypeScript type declarations for Chrome API usage
declare const chrome: any;

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { setAlertMessage } = useAlertMessage();

  // Handles changes in Google sign-in status
  const conductListener = () => {
    if (chrome && chrome.identity) {
      chrome.identity.onSignInChanged.addListener(function (
        _account: any,
        _signedIn: boolean
      ) {
        chrome.identity.clearAllCachedAuthTokens(() => {
          if (location.hash === "#/auth") {
            location.hash = "#/refresh";
            navigate("/auth");
          } else {
            navigate("/auth");
          }
        });
      });
    } else {
      setAlertMessage({
        title: "Error",
        description: "Please run this app on a Chrome extension.",
        show: true,
      });
    }
  };

  useEffect(() => {
    conductListener();
  }, []); // Empty dependency array ensures this runs once on mount

  const handleLogout = () => {
    if (user?.googleToken) {
      chrome.identity.launchWebAuthFlow(
        { url: "https://accounts.google.com/logout" },
        function () {
          chrome.identity.removeCachedAuthToken(
            { token: user?.googleToken },
            () => {
              revokeToken(user?.googleToken); // Revoke the token
              logout(); // Logout from the app
              navigate("/auth");
            }
          );
        }
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between shadow-lg p-2 absolute bg-white w-full">
        <Link to="/">
          <p className="text-xs text-gray-700">
            Effortless Summaries, Powered by Gemini AI
          </p>
        </Link>

        <div>
          {isAuthenticated && (
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>
                  <CircleUser className="cursor-pointer" />
                </MenubarTrigger>
                <MenubarContent>
                  <Link to="/profile">
                    <MenubarItem className="cursor-pointer">
                      <CircleUser /> <p className="mx-2">{user?.name}</p>
                    </MenubarItem>
                  </Link>
                  <Link to="/profile/settings">
                    <MenubarItem className="cursor-pointer">
                      <Settings /> <p className="mx-2">Settings</p>
                    </MenubarItem>
                  </Link>
                  <MenubarItem
                    className="cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut /> <p className="mx-2">Log Out</p>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )}
        </div>
      </div>
      <AlertTemplate />
    </div>
  );
}

export default Header;
