import Cookies from "js-cookie";
import { BACKEND_URL } from "../../constant";
import axios from "axios";

export const getUserDetails = async (
  setIsAuthen,
  setUser,
  setLoading,
  setError
) => {
  try {
    setLoading(true);

    // Get token from cookies
    const token = Cookies.get("token");

    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }

    // Send request with Authorization header

    const response = await axios.get(`${BACKEND_URL}/user/me`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (response.data.user) {
      setIsAuthen(true);
      setUser(response.data.user);
      console.log(response.data);
    }
  } catch (error) {
    setError(error.response?.data?.message || error.message);
    console.error("Error fetching user details:", error);
  } finally {
    setLoading(false);
  }
};
