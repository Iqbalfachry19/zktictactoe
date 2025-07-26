// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Tictactoe.sol";
import "../src/Verifier.sol"; // Path sesuai projectmu

contract DeployTictactoe is Script {
    function run() external {
        // Ganti dengan address dari Verifier yang sudah kamu deploy

        vm.startBroadcast();

        Tictactoe game = new Tictactoe(
            IVerifier(0x1964BEa127511E93612C2786B120a868E1470034)
        );

        vm.stopBroadcast();

        console.log("Tictactoe deployed to:", address(game));
    }
}
