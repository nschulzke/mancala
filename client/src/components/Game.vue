<template>
  <div>
    <h1 v-if="isWon()">Player {{game.won + 1}} wins!</h1>
    <h1 v-else>Mancala</h1>
    <div class="flex" v-if="game !== {}">
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
  </div>
</template>

<script>
  import axios from 'axios';

  let server = 'http://localhost:3000';

  export default {
    name: 'Game',
    data() {
      return {
        game: {},
        hit: [],
        holes: [13, 12, 11, 10, 9, 8, 1, 2, 3, 4, 5, 6],
      }
    },
    created: function () {
      this.getGame();
    },
    methods: {
      getGame: function () {
        axios.get(server + "/api/game").then(response => {
          this.game = response.data;
          return true;
        }).catch(err => {
        });
      },
      click: function (i) {
        this.hit = [];
        axios.post(server + "/api/game/move", {
          hole: i
        }).then(response => {
          if (response.data.success !== undefined && response.data.success === true) {
            this.game = response.data.game;
            this.hit = response.data.hit;
            return true;
          } else if (response.data.error !== undefined) {
            alert(response.data.error);
          } else alert("Error contacting server!");
        }).catch(err => {
        });
      },
      isTurn: function (i) {
        return this.game.turn === i;
      },
      isWon: function () {
        return this.game.won !== -1;
      },
      classes: function (i) {
        return {
          hit: this.hit.includes(i),
          player1: i > 0 && i < 7,
          player2: i > 7 && i < 14,
        }
      }
    },
  }
</script>
