import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import FutureWork from "./components/FutureWork";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/futurework" element={<FutureWork />} />
      </Routes>
    </Router>
  );
}

export default App;