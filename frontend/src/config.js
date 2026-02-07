export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "https://smart-city-backend.onrender.com/api"
    : "http://localhost:5000/api");
