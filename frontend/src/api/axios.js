import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

API.interceptors.request.use((config) => {
    const csrfToken = Cookies.get("csrfToken");
    if(csrfToken){
        config.headers["X-CSRF-Token"] = csrfToken;
    }
    return config;
});

export default API;