// src/pages/Home.tsx

import { useState } from "react";
import { useAccount, useWriteContract, useWatchContractEvent } from "wagmi";
import { tictactoeABI } from "../utils/abi";
import { TICTACTOE_ADDRESS } from "../constants";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Sparkles } from "lucide-react";

export default function Home() {
  const [opponent, setOpponent] = useState<string>("");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const navigate = useNavigate();

  useWatchContractEvent({
    address: TICTACTOE_ADDRESS,
    abi: tictactoeABI,
    eventName: "GameCreated",
    onLogs(logs) {
      const log = logs[0];
      if (!log) return;

      const newGameId = log.args.gameId as bigint;
      const player1 = log.args.player1 as string;

      if (player1.toLowerCase() !== address?.toLowerCase()) return;
      navigate(`/game/${newGameId.toString()}`);
    },
    poll: true,
    onError(e) {
      console.log(e);
    },
  });

  async function handleCreateGame() {
    if (!address) return;
    if (!opponent) {
      alert("Please input opponent address");
      return;
    }

    await writeContractAsync({
      address: TICTACTOE_ADDRESS,
      abi: tictactoeABI,
      functionName: "createGame",
      args: [opponent as `0x${string}`],
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-200 text-gray-800 flex flex-col items-center">
      <Header />

      <div className="mt-12 text-center">
        <h1 className="text-4xl font-extrabold text-orange-700 flex justify-center items-center gap-2">
          <Sparkles className="w-7 h-7 text-yellow-500 animate-pulse" />
          TicTacToe ZK
        </h1>
        <p className="text-sm text-gray-600 mt-2">Zero-Knowledge + Fun!</p>
      </div>

      <div className="mt-10 w-full max-w-md bg-white shadow-xl rounded-2xl p-6 flex flex-col items-center">
        <label className="w-full text-left text-sm text-gray-700 font-medium mb-1">
          Opponent Address
        </label>
        <input
          type="text"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          placeholder="0xABC..."
          className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
        />

        <button
          onClick={handleCreateGame}
          className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-lg font-semibold shadow-md transition transform hover:scale-105"
        >
          🎮 Create Game
        </button>
      </div>

      <div className="mt-10">
        <svg
          className="w-40 h-40 text-orange-300 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 6h.01M12 6h.01M18 6h.01M6 12h.01M12 12h.01M18 12h.01M6 18h.01M12 18h.01M18 18h.01"
          />
        </svg>
      </div>
    </div>
  );
}
