<template>
  <div>
    <h1>Mancala</h1>
    <div class="container">
      <h2>Rules</h2>
      <ul>
        <li>The board is divided into six holes, with each player having a store to their right.</li>
        <li>At the beginning of the game, each hole (besides the stores) has four pieces in it.</li>
        <li>On a player's turn, they take the pieces from any hole on their side of the board and, moving
          counter-clockwise, drop one piece into each consecutive hole until all pieces are used.
        </li>
        <li>If the previous movement ends with a piece dropping into a store (belonging to either player), the player
          takes another turn.
        </li>
        <li>The game is over when one player has emptied their side of the board and cannot move.</li>
        <li>That player wins.</li>
      </ul>
    </div>
    <div class="container">
      <h2>The Game</h2>
      <p>The online version here is multiplayer, and right now there exists one game. I'm going to build out a lobby,
        but
        right now, anyone can join the game and play as both sides.</p>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Lobby'
  }
</script>
