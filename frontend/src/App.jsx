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

function App() {
  const { setUser, user, setIsAuthen, setLoading, setError, loading } =
    useContext(UserContext);

  // useEffect(() => {
  //   const checkCookiesAndDispatch = async () => {
  //     const cookies = document.cookie
  //       .split("; ")
  //       .find((row) => row.startsWith("token="));
  //     const userToken = cookies ? cookies.split("=")[1] : null;

  //     console.log("USER TOKEN: User Login Status:", userToken);

  //     if (userToken) {
  //       await getUserDetails(setIsAuthen, setUser, setLoading, setError);
  //     }
  //     setLoading(false);
  //   };

  //   checkCookiesAndDispatch();
  // }, []);

  // if (loading) return <div>Loading...</div>; // Avoid flicker

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ClaimSubmitPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
