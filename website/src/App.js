import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import NextSteps from "./components/NextSteps";
import MainNavbar from "./components/MainNavbar";
import "./components/MainNavbar.css";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <MainNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nextsteps" element={<NextSteps />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;