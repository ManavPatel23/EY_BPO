import axios from "axios";
import Cookies from "js-cookie";

const token = Cookies.get("token");

console.log(token);

// Set default headers (e.g., for authentication)
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

export default axios;
