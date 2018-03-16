<template>
  <div class="block-container" v-else>
    <div class="paper">
      <h1>Mancala</h1>
      <p>If you're creating a new game, pick a game name and press Create.</p>
      <p>If you're joining a friend's game, enter the name they gave you for the game.</p>
      <form class="section gameForm">
        <div class="gameName">
        <label for="name">Game name:</label>
        <input v-model="gameName" id="name">
        </div>
        <div class="buttons">
          <button v-on:click="joinGame()">Join</button>
          <button v-on:click="createGame()">Create</button>
        </div>
      </form>
      <div class="section">
        <h2>Rules</h2>
        <p>There are lots of different ways to play Mancala, these are the rules here:</p>
        <ul>
          <li>The board is divided into six holes, with each player having a store to their right.</li>
          <li>At the beginning of the game, each hole (besides the stores) has four pieces in it.</li>
          <li>On a player's turn, they take the pieces from any hole on their side of the board and, moving
            counter-clockwise, drop one piece into each consecutive hole until all pieces are used.
          </li>
          <li>If the previous movement ends with a piece dropping into a store (belonging to either player), the player
            takes another turn.
          </li>
          <li>The game is over when one player has emptied their side of the board and cannot move. That player wins.</li>
        </ul>
      </div>
      <div class="section">
        <h2>This Site</h2>
        <p>The user interface is pretty simple for this app:</p>
        <ul>
          <li>You create a game by naming it above. If you don't want people to observe, give it a hard-to-guess name.
          </li>
          <li>The first player to join goes first, the second player to join goes second. Any other people who join are
            observers.
          </li>
          <li>Any player who disconnects from the game forfeits.</li>
          <li>There's a turn indictor to the right (desktop) or below (mobile), showing which side of the board is
            active.
            The bottom is Player 1, the top is Player 2.
          </li>
          <li>Below the board is the chat, which allows communication between players and observers.</li>
          <li>When you move, certain holes will be circled: these are the holes where your pieces were dropped.</li>
          <li>When it's your turn, your holes will be highlighted green.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';

  let server = 'http://cs260.nschulzke.com:4000/api';

  export default {
    name: 'Lobby',
    data: function () {
      return {
        gameName: ''
      }
    },
    methods: {
      joinGame: function () {
        this.checkGame('/join');
      },
      createGame: function () {
        this.checkGame('/create');
      },
      checkGame: function (endpoint) {
        axios.post(server + endpoint, {
          name: this.gameName
        }).then(response => {
          if (response.data.success === true) {
            this.navigateToGame();
            return true;
          } else if (response.data.error !== undefined) {
            alert(response.data.error);
          } else alert("Error contacting server!");
        }).catch(err => {
        });
      },
      navigateToGame: function () {
        this.$router.push({name: 'game', params: {name: this.gameName}});
      }
    }
  }
</script>
