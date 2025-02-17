import { useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import React from "react";
import "./App.css";
import { getUserDetails } from "@/context/User/user";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { UserContext } from "./context/userContext";
import ClaimSubmitPage from "./pages/ClaimSubmitPage";
import SeeAllClaimSubmitted from "./pages/SeeAllClaimSubmitted";
import { Sidebar } from "./Sidebar";

function App() {
  const { setUser, user, setIsAuthen, setLoading, setError, loading } =
    useContext(UserContext);

  useEffect(() => {
    const checkCookiesAndDispatch = async () => {
      const cookies = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="));
      const userToken = cookies ? cookies.split("=")[1] : null;

      console.log("USER TOKEN: User Login Status:", userToken);

      if (userToken) {
        await getUserDetails(setIsAuthen, setUser, setLoading, setError);
      }
      setLoading(false);
    };

    checkCookiesAndDispatch();
  }, []);

  if (loading) return <div>Loading...</div>; // Avoid flicker

  return (
    <div>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar className="" />
          <div className="flex-1 space-y-6 p-6 ml-14">
            <Routes>
              <Route path="/claim" element={<ClaimSubmitPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/all-claims" element={<SeeAllClaimSubmitted />} />
              <Route path="/hosp/login" element={<LoginPage />} />
              <Route path="/hosp/register" element={<SignUpPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
