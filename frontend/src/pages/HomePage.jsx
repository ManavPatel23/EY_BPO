import { UserContext } from "@/context/userContext";
import React, { useContext } from "react";

const HomePage = () => {
  const { setUser, user, setIsAuthen, setLoading, setError, setIsAgent } =
    useContext(UserContext);
  return (
    <div>
      <h1>{user.name}</h1>
    </div>
  );
};

export default HomePage;
