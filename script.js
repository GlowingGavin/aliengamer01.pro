const boardElement = document.getElementById('board');
const game = new Chess();

let board = Chessboard(boardElement, {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
});

let lastMoveSquares = [];

// Prevent moving pieces if game over or wrong turn
function onDragStart(source, piece, position, orientation) {
  if (game.game_over()) return false;

  // Only allow moving the correct color
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
}

// Handle piece drop
function onDrop(source, target) {
  const move = game.move({ from: source, to: target, promotion: 'q' });

  // Illegal move
  if (move === null) return 'snapback';

  // Highlight last move squares
  removeHighlights();
  lastMoveSquares = [move.from, move.to];
  highlightSquares(lastMoveSquares);

  // Check game status
  if (game.in_checkmate()) {
    setTimeout(() => alert('Checkmate! Game over.'), 100);
  } else if (game.in_draw()) {
    setTimeout(() => alert('Draw!'), 100);
  }
}

// Update board after move
function onSnapEnd() {
  board.position(game.fen());
}

// Highlight squares
function highlightSquares(squares) {
  squares.forEach(square => {
    const squareEl = $('.square-' + square);
    squareEl.addClass('highlight');
  });
}

// Remove previous highlights
function removeHighlights() {
  $('.square-55d63').removeClass('highlight');
}
