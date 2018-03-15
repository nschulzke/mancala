<template>
  <div>
    <h1 v-if="isWon()">Player {{game.won + 1}} wins!</h1>
    <h1 v-else-if="game.holes !== undefined">{{gameName}}</h1>
    <div class="flex" v-if="game.holes !== undefined">
      <div class="board-container-outer">
        <div class="board-container-inner">
          <div class="board">
            <div class="dest" v-bind:class="classes(0)">
              <div class="pieces">{{game.holes[0]}}</div>
            </div>
            <div class="hole" v-for="i in holes" v-on:click="click(i)" v-bind:class="classes(i)">
              <div class="pieces">{{game.holes[i]}}</div>
            </div>
            <div class="dest" v-bind:class="classes(7)">
              <div class="pieces">{{game.holes[7]}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="turn-indicator">
        <div class="player-turn" v-bind:class="{ turn: isTurn(1) }"></div>
        <div class="player-turn" v-bind:class="{ turn: isTurn(0) }"></div>
      </div>
    </div>
    <div class="container" v-else>
      <p>If you're creating a new game, pick a game name and press Create. If you're joining
        a friend's game, enter the name they gave you for the game.</p>
      <form>
        <label>Game name:</label>
        <input v-model="gameName">
        <div>
          <button v-on:click="joinGame()">Join</button>
          <button v-on:click="createGame()">Create</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';

  let server = 'http://localhost:3000/api';

  export default {
    name: 'Game',
    data() {
      return {
        game: {},
        hit: [],
        holes: [13, 12, 11, 10, 9, 8, 1, 2, 3, 4, 5, 6],
        socket: {},
        gameName: '',
      }
    },
    methods: {
      click: function (i) {
        this.hit = [];
        this.socket.send(JSON.stringify({action: 'move', hole: i}));
      },
      isTurn: function (i) {
        return this.game.turn === i;
      },
      isWon: function () {
        return this.game.won !== undefined && this.game.won !== -1;
      },
      classes: function (i) {
        return {
          hit: this.hit.includes(i),
          player1: i > 0 && i < 7,
          player2: i > 7 && i < 14,
        }
      },
      initWebSocket: function () {
        this.socket = new WebSocket('ws://localhost:3000/api/game/' + this.gameName);

        this.socket.addEventListener('message', (event) => {
          console.log('data');
          let data = JSON.parse(event.data);
          if (data.success === true) {
            this.game = data.game;
            if (data.hit !== undefined) {
              this.hit = data.hit;
            }
          }
          else alert(data.error);
        });
      },
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
            this.initWebSocket();
            return true;
          } else if (response.data.error !== undefined) {
            alert(response.data.error);
          } else alert("Error contacting server!");
        }).catch(err => {
        });
      }
    },
  }
</script>

<style scoped>
  h1 {
    margin: 0;
  }
  form {
    margin-top: 1rem;
  }
  form div {
    margin-top: 0.5rem;
  }
</style>
