// src/App.js
import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import LandingPage from "./pages/LandingPage";
import StorePage from "./pages/StorePage";
import AdminPage from "./pages/AdminPage";
import "./index.css";

// Amplify v6 configuration — uses explicit config object instead of aws-exports
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-2_qXO8kHFOj",
      userPoolClientId: "47edciociemavkgvunh74u1pp8",
      loginWith: {
        email: true,
      },
    },
  },
  API: {
    REST: {
      PixorusAPI: {
        endpoint: "https://t19fbnere7.execute-api.us-east-2.amazonaws.com/prod",
        region: "us-east-2",
      },
    },
  },
});

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
