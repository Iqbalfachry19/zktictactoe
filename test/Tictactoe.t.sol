// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Tictactoe.sol";
import {IVerifier} from "../src/Verifier.sol";

contract MockVerifier is IVerifier {
    bool public shouldPass = true;

    function setShouldPass(bool _shouldPass) external {
        shouldPass = _shouldPass;
    }

    function verify(
        bytes calldata,
        bytes32[] calldata
    ) external view override returns (bool) {
        return shouldPass;
    }
}

contract TictactoeTest is Test {
    Tictactoe public game;
    MockVerifier public verifier;

    address player1 = address(0xA1);
    address player2 = address(0xB2);

    function setUp() public {
        verifier = new MockVerifier();
        game = new Tictactoe(verifier);
    }

    function testCreateGame() public {
        vm.prank(player1);
        uint gameId = game.createGame(player2);
        (address p1, address p2, bool finished, uint8 winner, uint8 turn) = game
            .games(gameId);

        assertEq(p1, player1);
        assertEq(p2, player2);
        assertEq(finished, false);
        assertEq(winner, 0);
        assertEq(turn, 1);
    }

    function testMakeValidMoveSwitchesTurn() public {
        vm.startPrank(player1);
        uint gameId = game.createGame(player2);

        bytes memory proof = "dummy"; // MockVerifier always returns true
        uint8 status = 0; // ongoing

        game.makeMove(gameId, proof, status);

        (, , bool finished, , uint8 turn) = game.games(gameId);
        assertEq(finished, false);
        assertEq(turn, 2); // switched to O
    }

    function testWrongPlayerCannotMove() public {
        vm.startPrank(player2);
        uint gameId = game.createGame(player2);

        bytes memory proof = "dummy";
        uint8 status = 0;

        vm.expectRevert("Not your turn");
        game.makeMove(gameId, proof, status);
    }

    function testFinishAndMintReward() public {
        vm.startPrank(player1);
        uint gameId = game.createGame(player2);

        bytes memory proof = "dummy";
        uint8 status = 1; // X menang

        game.makeMove(gameId, proof, status);

        (, , bool finished, uint8 winner, ) = game.games(gameId);
        assertEq(finished, true);
        assertEq(winner, 1);

        assertEq(game.balanceOf(player1, 0), 1);
        assertEq(game.balanceOf(player2, 0), 0);
    }

    function testCannotMoveAfterFinished() public {
        vm.startPrank(player1);
        uint gameId = game.createGame(player2);

        bytes memory proof = "dummy";

        // X menang
        game.makeMove(gameId, proof, 1);

        vm.expectRevert("Game done");
        game.makeMove(gameId, proof, 0);
    }

    function testVerifierFails() public {
        vm.startPrank(player1);
        uint gameId = game.createGame(player2);

        verifier.setShouldPass(false); // Force fail

        bytes memory proof = "dummy";

        vm.expectRevert("Invalid proof");
        game.makeMove(gameId, proof, 0);
    }
}
