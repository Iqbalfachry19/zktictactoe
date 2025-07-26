import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import zk from "../assets/zk.json";
import { useWriteContract } from "wagmi";
import { type CompiledCircuit, Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend } from "@aztec/bb.js";
import { tictactoeABI } from "../utils/abi";
import { TICTACTOE_ADDRESS } from "../constants";
import mqtt from "mqtt";

export default function GameRoom() {
  const { gameId } = useParams<{ gameId: string }>();
  const [board, setBoard] = useState<number[]>(Array(9).fill(0));
  const [player, setPlayer] = useState<number>(1);
  const [status, setStatus] = useState<number>(0);
  const { writeContractAsync } = useWriteContract();
  const gameUrl = `${window.location.origin}/game/${gameId}`;
  const client = mqtt.connect("wss://broker.emqx.io:8084/mqtt");

  useEffect(() => {
    if (gameId) {
      const savedBoard = localStorage.getItem(`tictactoe_board_${gameId}`);
      const savedPlayer = localStorage.getItem(`tictactoe_player_${gameId}`);
      const savedStatus = localStorage.getItem(`tictactoe_status_${gameId}`);

      if (savedBoard) setBoard(JSON.parse(savedBoard));
      if (savedPlayer) setPlayer(Number(savedPlayer));
      if (savedStatus) setStatus(Number(savedStatus));
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    const topic = `tictactoe/${gameId}/update`;

    client.on("connect", () => {
      client.subscribe(topic);
    });

    client.on("message", (_topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (payload.board && payload.player && payload.status !== undefined) {
          setBoard(payload.board);
          setPlayer(payload.player);
          setStatus(payload.status);

          localStorage.setItem(
            `tictactoe_board_${gameId}`,
            JSON.stringify(payload.board)
          );
          localStorage.setItem(
            `tictactoe_player_${gameId}`,
            String(payload.player)
          );
          localStorage.setItem(
            `tictactoe_status_${gameId}`,
            String(payload.status)
          );
        }
      } catch (e) {
        console.error("Invalid MQTT message:", e);
      }
    });

    return () => {
      client.unsubscribe(topic);
    };
  }, [gameId]);

  function copyLinkToClipboard() {
    navigator.clipboard.writeText(gameUrl).then(() => {
      alert("Link copied to clipboard!");
    });
  }

  function uint8ArrayToHex(buffer: Uint8Array): string {
    return [...buffer].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function computeStatus(board: number[]) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    let winner = 0;
    for (const [a, b, c] of lines) {
      if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
        winner = board[a];
      }
    }
    const full = board.every((cell) => cell !== 0);
    return winner !== 0 ? winner : full ? 3 : 0;
  }

  async function handleCellClick(index: number) {
    if (!gameId || board[index] !== 0 || status !== 0) return;

    const oldBoard = [...board];
    const newBoard = [...board];
    newBoard[index] = player;

    const newStatus = computeStatus(newBoard);
    const noir = new Noir(zk as CompiledCircuit);
    const input = {
      game_status: newStatus,
      old_board: oldBoard,
      new_board: newBoard,
      move_pos: index,
      player,
    };

    const backend = new UltraHonkBackend(zk.bytecode, { threads: 1 });
    const { witness } = await noir.execute(input);
    const offChainProof = await backend.generateProof(witness);
    const { proof } = await backend.generateProof(witness, { keccak: true });

    const isValid = await backend.verifyProof(offChainProof);
    console.log("Proof valid:", isValid);

    await writeContractAsync({
      address: TICTACTOE_ADDRESS,
      abi: tictactoeABI,
      functionName: "makeMove",
      args: [BigInt(gameId), `0x${uint8ArrayToHex(proof)}`, newStatus],
    });

    const nextPlayer = player === 1 ? 2 : 1;
    setBoard(newBoard);
    setPlayer(nextPlayer);
    setStatus(newStatus);

    localStorage.setItem(`tictactoe_board_${gameId}`, JSON.stringify(newBoard));
    localStorage.setItem(`tictactoe_player_${gameId}`, String(nextPlayer));
    localStorage.setItem(`tictactoe_status_${gameId}`, String(newStatus));

    client.publish(
      `tictactoe/${gameId}/update`,
      JSON.stringify({
        board: newBoard,
        player: nextPlayer,
        status: newStatus,
      }),
      { retain: true }
    );
  }

  return (
    <div className="min-h-screen  bg-orange-50 text-gray-800 flex flex-col items-center pb-20">
      <Header />

      <div className="max-w-md w-full mt-6 bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center text-orange-600">
          🎮 Game Room
        </h1>
        <p className="text-sm text-center text-gray-500 mt-1">
          ID: {gameId?.slice(0, 6)}...{gameId?.slice(-4)}
        </p>

        {/* Copy Link */}
        <div className="flex gap-2 mt-4">
          <input
            value={gameUrl}
            readOnly
            className="flex-1 px-3 py-2 border rounded-md text-sm"
          />
          <button
            onClick={copyLinkToClipboard}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md text-sm"
          >
            Copy
          </button>
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {board.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              className={`w-24 h-24 rounded-xl text-4xl font-bold transition duration-200 shadow-sm border-2
                ${
                  cell === 1
                    ? "bg-blue-100 text-blue-600 border-blue-400"
                    : cell === 2
                    ? "bg-pink-100 text-pink-600 border-pink-400"
                    : "bg-white hover:bg-orange-100 border-gray-300"
                }`}
            >
              {cell === 1 ? "X" : cell === 2 ? "O" : ""}
            </button>
          ))}
        </div>

        {/* Game Status */}
        <div className="mt-6 text-center text-lg font-semibold">
          <p>
            Turn:{" "}
            <span className={player === 1 ? "text-blue-600" : "text-pink-600"}>
              {player === 1 ? "X" : "O"}
            </span>{" "}
            | Status:{" "}
            <span
              className={
                status === 1
                  ? "text-blue-600"
                  : status === 2
                  ? "text-pink-600"
                  : status === 3
                  ? "text-yellow-600"
                  : "text-gray-700"
              }
            >
              {status === 0
                ? "Ongoing"
                : status === 1
                ? "X Wins 🎉"
                : status === 2
                ? "O Wins 🎉"
                : "Draw 🤝"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
