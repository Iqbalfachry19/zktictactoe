// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IVerifier} from "./Verifier.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Tictactoe is ERC1155, Ownable {
    IVerifier public s_verifier;

    event VerifierUpdated(IVerifier verifier);
    event GameCreated(
        uint indexed gameId,
        address indexed player1,
        address indexed player2
    );
    struct Game {
        address player1;
        address player2;
        bool isFinished;
        uint8 winner; // 0: ongoing, 1: X menang, 2: O menang, 3: draw
        uint8 turn; // 1: X, 2: O
    }

    mapping(uint => Game) public games;

    constructor(
        IVerifier _verifier
    )
        ERC1155(
            "ipfs://bafybeicqfc4ipkle34tgqv3gh7gccwhmr22qdg7p6k6oxon255mnwb6csi/{id}.json"
        )
        Ownable(msg.sender)
    {
        s_verifier = _verifier;
    }

    function setVerifier(IVerifier _verifier) external onlyOwner {
        s_verifier = _verifier;
        emit VerifierUpdated(_verifier);
    }

    function createGame(address opponent) external returns (uint gameId) {
        gameId = uint(
            keccak256(abi.encodePacked(msg.sender, opponent, block.timestamp))
        );

        games[gameId] = Game({
            player1: msg.sender,
            player2: opponent,
            isFinished: false,
            winner: 0,
            turn: 1 // X always starts
        });
        emit GameCreated(gameId, msg.sender, opponent);
    }

    function makeMove(
        uint gameId,
        bytes calldata proof,
        uint8 gameStatus
    ) public {
        Game storage game = games[gameId];
        require(!game.isFinished, "Game done");

        // ✅ Siapa seharusnya jalan
        address expectedPlayer = game.turn == 1 ? game.player1 : game.player2;
        require(msg.sender == expectedPlayer, "Not your turn");

        // 🔒 Public inputs: hanya status game yg diverifikasi
        bytes32[] memory publicInputs = new bytes32[](1);
        publicInputs[0] = bytes32(uint256(gameStatus));

        require(s_verifier.verify(proof, publicInputs), "Invalid proof");

        // ✅ Update turn
        if (gameStatus == 0) {
            game.turn = game.turn == 1 ? 2 : 1; // Switch turn
        } else {
            game.isFinished = true;
            game.winner = gameStatus;

            if (gameStatus == 1) {
                _mint(game.player1, 0, 1, "");
            } else if (gameStatus == 2) {
                _mint(game.player2, 0, 1, "");
            }
            // draw = tidak mint apa-apa
        }
    }
}
