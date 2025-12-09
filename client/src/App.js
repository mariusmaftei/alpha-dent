import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import AnalysisPage from "./pages/analisys/AnalysisPage";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/analysis",
    element: <AnalysisPage />,
  },
]);

function App() {
  return (
    <div className="app-shell">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
