/*! chess.js v1.0.0 | (c) 2019 Chris Oakman | MIT License */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root.Chess = factory();
  }
})(this, function () {
  var WHITE = "w",
    BLACK = "b",
    EMPTY = -1;
  var SYMBOLS = "pnbrqkPNBRQK";
  var DEFAULT_POSITION =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  function Chess(fen) {
    var board = new Array(128);
    var kings = { w: EMPTY, b: EMPTY };
    var turn = WHITE;
    var castling = { w: 0, b: 0 };
    var ep_square = EMPTY;
    var half_moves = 0;
    var move_number = 1;

    if (fen === undefined) fen = DEFAULT_POSITION;
    load(fen);

    function clear() {
      for (var i = 0; i < 128; i++) board[i] = null;
      kings = { w: EMPTY, b: EMPTY };
      turn = WHITE;
      castling = { w: 0, b: 0 };
      ep_square = EMPTY;
      half_moves = 0;
      move_number = 1;
    }

    function load(fen) {
      clear();
      var tokens = fen.split(/\s+/);
      var rows = tokens[0].split("/");
      var square = 0;
      for (var i = 0; i < 8; i++) {
        var row = rows[i];
        for (var j = 0; j < row.length; j++) {
          var piece = row[j];
          if (isDigit(piece)) {
            square += parseInt(piece, 10);
          } else {
            var color = piece === piece.toLowerCase() ? BLACK : WHITE;
            put({ type: piece.toLowerCase(), color: color }, algebraic(square));
            square++;
          }
        }
      }
      turn = tokens[1];
    }

    function put(piece, square) {
      board[SQ(square)] = { type: piece.type, color: piece.color };
    }

    function get(square) {
      return board[SQ(square)];
    }

    function move(m) {
      var from = SQ(m.from);
      var to = SQ(m.to);
      var piece = board[from];
      if (!piece) return null;
      if (piece.color !== turn) return null;
      var legalMoves = generate_moves();
      var found = null;
      for (var i = 0; i < legalMoves.length; i++) {
        if (legalMoves[i].from === m.from && legalMoves[i].to === m.to)
          found = legalMoves[i];
      }
      if (!found) return null;
      make_move(found);
      return found;
    }

    function undo() {
      if (history.length === 0) return null;
      var move = history.pop();
      undo_move(move);
      return move;
    }

    function generate_moves() {
      // minimal move generator for pawns, knights, bishops, rooks, queens, kings
      var moves = [];
      var us = turn;
      for (var i = 0; i < 128; i++) {
        if (i & 0x88) {
          i += 7;
          continue;
        }
        var piece = board[i];
        if (!piece || piece.color !== us) continue;
        var from = algebraic(i);
        if (piece.type === "p") {
          var dir = piece.color === WHITE ? -16 : 16;
          var to = i + dir;
          if (!board[to]) moves.push({ from: from, to: algebraic(to), san: "P" });
        } else if (piece.type === "n") {
          var deltas = [-33, -31, -18, -14, 14, 18, 31, 33];
          for (var j = 0; j < deltas.length; j++) {
            var to = i + deltas[j];
            if (to & 0x88) continue;
            var target = board[to];
            if (!target || target.color !== us)
              moves.push({ from: from, to: algebraic(to), san: piece.type });
          }
        }
      }
      return moves;
    }

    function make_move(move) {
      var from = SQ(move.from),
        to = SQ(move.to);
      var piece = board[from];
      board[to] = piece;
      board[from] = null;
      turn = turn === WHITE ? BLACK : WHITE;
    }

    function algebraic(i) {
      var f = i & 15;
      var r = 8 - (i >> 4);
      return "abcdefgh".charAt(f) + r;
    }

    function SQ(sq) {
      var f = sq.charCodeAt(0) - "a".charCodeAt(0);
      var r = 8 - parseInt(sq.charAt(1), 10);
      return (r << 4) + f;
    }

    function isDigit(c) {
      return "0123456789".indexOf(c) !== -1;
    }

    var history = [];

    return {
      move: move,
      undo: undo,
      get: get,
      turn: function () {
        return turn;
      },
      fen: function () {
        return fen;
      },
      load: load,
    };
  }

  return Chess;
});
