/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "@/components/home/Home";
import GoogleAuth from "@/auth/GoogleAuth";
import Profile from "@/components/profile/Profile";
import Settings from "@/components/profile/settings/Settings";

declare const chrome: any;

function DomRouter() {
  return (
    <HashRouter>
      <Routes>
        {/* Main Router */}
        <Route path="/" element={<Navigate to="/auth"></Navigate>}></Route>
        {/* Home Router */}
        <Route path="home" element={<Home />} />
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
