/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import GoogleAuth from "@/auth/GoogleAuth";
import Profile from "@/components/profile/Profile";
import Settings from "@/components/profile/settings/Settings";
import Chatbox from "@/components/home/chatbox/Chatbox";

function DomRouter() {
  return (
    <HashRouter>
      <Routes>
        {/* Main Router */}
        <Route path="/" element={<Navigate to="/auth"></Navigate>}></Route>
        {/* Home Router */}
        <Route path="chatbox" element={<Chatbox />} />
        <Route path="auth" element={<GoogleAuth />} />

        {/* snippets Routes */}
        <Route path="profile">
          <Route path="" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* home outlet routes */}
        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </HashRouter>
  );
}

export default DomRouter;
