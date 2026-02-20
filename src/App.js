// src/App.js — No Amplify dependency, uses direct Cognito auth
import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import LandingPage from "./pages/LandingPage";
import StorePage from "./pages/StorePage";
import AdminPage from "./pages/AdminPage";
import "./index.css";

function getRoute() {
  const hash = window.location.hash;
  if (hash === "#admin") return "admin";
  if (hash === "#store") return "store";
  return "landing";
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to) => {
    window.location.hash = to;
    setRoute(to);
  };

  return (
    <ThemeProvider>
      <CartProvider>
        {route === "landing" && <LandingPage navigate={navigate} />}
        {route === "store" && <StorePage navigate={navigate} />}
        {route === "admin" && <AdminPage navigate={navigate} />}
      </CartProvider>
    </ThemeProvider>
  );
}
