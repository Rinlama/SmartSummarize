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

declare const chrome: any;

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { setAlertMessage } = useAlertMessage();

  const conductListener = () => {
    chrome.identity.onSignInChanged.addListener(function (
      _account: any,
      _signedIn: any
    ) {
      chrome.identity.clearAllCachedAuthTokens(() => {
        if (window.location.hash === "#/auth") {
          window.location.hash = "#/refresh";
          navigate("/auth");
        } else {
          navigate("/auth");
        }
      });
    });
  };
  useEffect(() => {
    try {
      conductListener();
    } catch (error) {
      setAlertMessage({
        title: "Error",
        description: "Please run on Chrome extension",
        show: true,
      });
      return;
    }
  }, []);

  return (
    <div>
      <div className="flex justify-between shadow-lg p-2 absolute bg-white w-full">
        <Link to="/">
          <p className="text-xs fo text-gray-700">
            Effortless Summaries, Powered by Gemini AI
          </p>
        </Link>

        <div>
          {!isAuthenticated ? null : (
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
                    onClick={() => {
                      chrome.identity.launchWebAuthFlow(
                        { url: "https://accounts.google.com/logout" },
                        function async() {
                          chrome.identity.removeCachedAuthToken(
                            { token: user?.googleToken },
                            () => {
                              if (user?.googleToken) {
                                revokeToken(user?.googleToken);
                                logout();
                              }
                            }
                          );
                          navigate("/auth");
                        }
                      );
                    }}
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
