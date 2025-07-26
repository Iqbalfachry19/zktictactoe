fn main(
    // Public inputs
    game_status: pub u8,
    // Private inputs
    old_board: [u8; 9],
    new_board: [u8; 9],
    move_pos: u32,
    player: u8, // 1 or 2
) {
    // 1. Langkah valid: cell kosong di old_board
    assert(old_board[move_pos] == 0);
    assert(new_board[move_pos] == player);

    // 2. Pastikan semua cell lain sama
    for i in 0..9 {
        if i != move_pos {
            assert(old_board[i] == new_board[i]);
        }
    }

    // 3. Validasi status
    let status = compute_status(new_board);
    assert(status == game_status);
}
fn compute_status(board: [u8; 9]) -> u8 {
    let lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
        [0, 4, 8], [2, 4, 6], // diagonals
    ];
    let mut winner: u8 = 0;

    for line in lines {
        let a = board[line[0]];
        let b = board[line[1]];
        let c = board[line[2]];
        if (a != 0) & (a == b) & (b == c) {
            winner = a;
        }
    }

    let mut full = true;
    for i in 0..9 {
        if board[i] == 0 {
            full = false;
        }
    }

    if winner != 0 {
        winner
    } else if full {
        3 // draw
    } else {
        0 // ongoing
    }
}
#[test]
fn test_main() {
    let old_board: [u8; 9] = [0; 9];
    let mut new_board = old_board;
    let move_pos: u32 = 0;
    let player: u8 = 1;

    new_board[move_pos] = player;

    let game_status: u8 = compute_status(new_board);

    main(game_status, old_board, new_board, move_pos, player);
}
#[test]
fn test_second_move() {
    // X di pos 0
    let mut board_step1 = [0; 9];
    board_step1[0] = 1;

    let mut board_step2 = board_step1;
    let move_pos: u32 = 1; // O di pos 1
    let player: u8 = 2;
    board_step2[move_pos] = player;

    let status = compute_status(board_step2);
    main(status, board_step1, board_step2, move_pos, player);
}
#[test]
fn test_third_move() {
    // X di 0, O di 1
    let mut board_step2 = [0; 9];
    board_step2[0] = 1;
    board_step2[1] = 2;

    let mut board_step3 = board_step2;
    let move_pos: u32 = 2; // X di pos 2
    let player: u8 = 1;
    board_step3[move_pos] = player;

    let status = compute_status(board_step3);
    main(status, board_step2, board_step3, move_pos, player);
}
#[test]
fn test_fourth_move() {
    // X di 0, X di 2, O di 1
    let mut board_step3 = [0; 9];
    board_step3[0] = 1;
    board_step3[1] = 2;
    board_step3[2] = 1;

    let mut board_step4 = board_step3;
    let move_pos: u32 = 3; // O di pos 3
    let player: u8 = 2;
    board_step4[move_pos] = player;

    let status = compute_status(board_step4);
    main(status, board_step3, board_step4, move_pos, player);
}
#[test]
fn test_fifth_move_win() {
    // X: 0, 2 ; O: 1, 3
    let mut board_step4 = [0; 9];
    board_step4[0] = 1; // X
    board_step4[1] = 2; // X
    board_step4[3] = 1; // X
    // O di mana pun tidak ganggu diag
    board_step4[1] = 2;

    let mut board_step5 = board_step4;
    let move_pos: u32 = 6; // X di pos 8 bikin diag [0,4,8] full X
    let player: u8 = 1;
    board_step5[move_pos] = player;

    let status = compute_status(board_step5);
    assert(status == 1); // X menang
    main(status, board_step4, board_step5, move_pos, player);
}
#[test]
fn test_o_win() {
    let mut board_step4 = [0; 9];
    board_step4[1] = 2; // O
    board_step4[4] = 2; // O
    // X di posisi lain tidak ganggu col
    board_step4[0] = 1;
    board_step4[2] = 1;

    let mut board_step5 = board_step4;
    let move_pos: u32 = 7; // O di pos 7 -> [1,4,7] full O
    let player: u8 = 2;
    board_step5[move_pos] = player;
    let status = compute_status(board_step5);
    assert(status == 2); // O menang
    main(status, board_step4, board_step5, move_pos, player);
}
#[test]
fn test_draw() {
    let mut old_board = [1, 2, 1, 1, 2, 2, 2, 1, 0]; // pos 8 kosong
    let mut new_board = old_board;
    let move_pos: u32 = 8;
    let player: u8 = 1;
    new_board[move_pos] = player;

    let status = compute_status(new_board);
    assert(status == 3); // seri

    main(status, old_board, new_board, move_pos, player);
}
#[test]
fn test_x_win_sequence() {
    let mut board = [0; 9];

    // Step 1: X di pos 0
    let mut new_board = board;
    new_board[0] = 1;
    main(compute_status(new_board), board, new_board, 0, 1);
    board = new_board;

    // Step 2: O di pos 1
    let mut new_board = board;
    new_board[1] = 2;
    main(compute_status(new_board), board, new_board, 1, 2);
    board = new_board;

    // Step 3: X di pos 4
    let mut new_board = board;
    new_board[4] = 1;
    main(compute_status(new_board), board, new_board, 4, 1);
    board = new_board;

    // Step 4: O di pos 2
    let mut new_board = board;
    new_board[2] = 2;
    main(compute_status(new_board), board, new_board, 2, 2);
    board = new_board;

    // Step 5: X di pos 8
    let mut new_board = board;
    new_board[8] = 1;
    let status = compute_status(new_board);
    assert(status == 1); // X menang
    main(status, board, new_board, 8, 1);
}
