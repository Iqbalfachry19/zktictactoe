import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Web3Provider } from "./config/Web3Provider";
import Home from "./route/Home";
import GameRoom from "./route/GameRoom";
export default function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:gameId" element={<GameRoom />} />
          {/* New route for editing work */}
        </Routes>
      </BrowserRouter>
    </Web3Provider>
  );
}
