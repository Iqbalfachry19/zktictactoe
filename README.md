# 🕹️ ZKTicTacToe

**ZKTicTacToe** is a privacy-preserving multiplayer Tic Tac Toe game built with **Zero-Knowledge Proofs (ZKPs)** using **Noir**. It leverages **React** for the frontend, **MQTT** for real-time communication, and **XellarKit** for Web3 wallet integration on the **Sepolia Ethereum testnet**. **Lisk** is optionally explored for modular blockchain interoperability.

---

## ⚙️ Tech Stack

| Tech          | Description                                              |
| ------------- | -------------------------------------------------------- |
| **React**     | Frontend UI for game rendering and interactions          |
| **Noir**      | Domain-specific language to build and verify ZK circuits |
| **MQTT**      | Lightweight pub/sub protocol for real-time gameplay      |
| **Sepolia**   | Ethereum testnet for smart contract deployment           |
| **XellarKit** | Web3 wallet connector for authentication and signing     |
| **Lisk**      | Modular blockchain SDK for future scalability (optional) |

---

## 🧩 Features

- 🔐 **Zero-Knowledge Move Validation** — Prove the move is valid without revealing the actual move
- 👥 **PvP Multiplayer via MQTT** — Real-time player-to-player gameplay
- 🌐 **Web3 Integration** — Authenticate players and sign data using XellarKit
- 🔄 **Modular Architecture** — Designed for scalability and potential L2/Lisk integration

---

## 🚀 Getting Started

```bash
git clone https://github.com/Iqbalfachry19/zktictactoe.git
cd zktictactoe
npm install
✅ Requirements

Node.js v18+
Sepolia ETH wallet
MQTT broker (you can use a public one like HiveMQ or run one locally)
Noir toolchain (noirup, nargo)
Wallet compatible with XellarKit
▶️ Running the Project

npm run dev
🔧 Building the ZK Circuit (Noir)

Install Noir toolchain
curl -L https://noirup.sh | bash
noirup nightly
Build the circuit
cd circuits
nargo build
Generate proof & verifier
nargo prove
nargo codegen-verifier
📡 MQTT Configuration

Edit the MQTT connection in src/config/mqtt.js:

export const MQTT_BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
export const MQTT_TOPIC = 'zktictactoe/game';
🔐 Smart Contract (Sepolia)

You may optionally deploy a smart contract to:

Record final game results
Manage bets/wagers
Log match history on-chain
Recommended tools:

Hardhat
Foundry
🧠 Game Flow with ZK

Player creates a move (X or O)
A ZK proof is generated to show the move is valid (e.g. the cell is empty)
The proof is sent via MQTT to the opponent
The opponent verifies the proof without knowing the move until it's revealed
