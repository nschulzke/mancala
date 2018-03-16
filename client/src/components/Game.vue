<template>
  <div>
    <h1 v-if="game.holes !== undefined">{{gameName}}</h1>
    <div v-if="game.holes !== undefined">
      <div class="flex">
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
      <div class="chatbox container">
        <div class="chats">
          <p v-for="chat in chats"><cite>{{chat.name}}:</cite> {{chat.chat}}</p>
        </div>
        <form>
          <input v-model="chatDraft">
          <button v-on:click="sendChat()">Send</button>
        </form>
      </div>
    </div>
    <div class="container" v-else>
      <h1>Mancala</h1>
      <p>If you're creating a new game, pick a game name and press Create.</p>
      <p>If you're joining a friend's game, enter the name they gave you for the game.</p>
      <form>
        <label>Game name:</label>
        <input v-model="gameName">
        <div>
          <button v-on:click="joinGame()">Join</button>
          <button v-on:click="createGame()">Create</button>
        </div>
      </form>
      <div>
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
          <li>The game is over when one player has emptied their side of the board and cannot move.</li>
          <li>That player wins.</li>
        </ul>
      </div>
      <div>
        <h2>This Site</h2>
        <p>The user interface is pretty simple for this app:</p>
        <ul>
          <li>You create a game by naming it above. If you don't want people to observe, give it a hard-to-guess name.
          </li>
          <li>The first player to join goes first, the second player to join goes second. Any other people who join are
            observers.
          </li>
          <li>Any player who disconnects from the game forfeits.</li>
          <li>There's a turn indictor to the right (desktop) or below (mobile), showing which side of the board is active. The bottom is Player 1, the top is Player 2.</li>
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
        player: -1,
        chats: [],
        chatDraft: '',
      }
    },
    methods: {
      click: function (index) {
        if (this.isClickable(index)) {
          this.socket.send(JSON.stringify({action: 'move', hole: index}));
        }
      },
      sendChat: function () {
        this.socket.send(JSON.stringify({action: 'chat', chat: this.chatDraft}));
        this.chatDraft = '';
      },
      isTurn: function (player) {
        return this.game.turn === player;
      },
      isWon: function () {
        return this.game.won !== undefined && this.game.won !== -1;
      },
      classes: function (index) {
        return {
          hit: this.hit.includes(index),
          player1: this.belongsTo(0, index),
          player2: this.belongsTo(1, index),
          clickable: this.isClickable(index),
        }
      },
      belongsTo: function (player, index) {
        if (player === 0)
          return index > 0 && index < 7;
        else if (player === 1)
          return index > 7 && index < 14;
        else return false;
      },
      isClickable: function (index) {
        return this.belongsTo(this.player, index) && this.isTurn(this.player);
      },
      initWebSocket: function () {
        this.socket = new WebSocket('ws://localhost:3000/api/game/' + this.gameName);

        this.socket.addEventListener('message', (event) => {
          let data = JSON.parse(event.data);
          if (data.success === true) {
            this.game = data.game;
            if (data.player <= 1) {
              this.player = data.player;
            } else this.player = false;
            this.hit = data.hit;
            this.chats = data.chats;
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
  form {
    margin-top: 1rem;
  }

  form div {
    margin-top: 0.5rem;
  }
</style>
