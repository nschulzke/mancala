<template>
  <div>
    <div class="block-container h1">
      <h1 v-if="game.holes !== undefined">{{gameName}}</h1>
      <h1 v-else>Loading game...</h1>
    </div>
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
        <div id="chats" class="chats">
          <p v-for="chat in chats"><cite>{{chat.name}}:</cite> {{chat.chat}}</p>
        </div>
        <form>
          <input v-model="chatDraft">
          <button v-on:click="sendChat()">Send</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Game',
    data() {
      return {
        game: {},
        hit: [],
        holes: [13, 12, 11, 10, 9, 8, 1, 2, 3, 4, 5, 6],
        socket: {},
        gameName: this.$route.params.name,
        player: -1,
        chats: [],
        chatDraft: '',
        token: '',
      }
    },
    created: function () {
      this.initWebSocket();
    },
    updated: function () {
      let chats = this.$el.querySelector("#chats");
      chats.scrollTop = chats.scrollHeight;
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
        return !this.isWon() && this.belongsTo(this.player, index) && this.isTurn(this.player);
      },
      initWebSocket: function () {
        this.token = window.sessionStorage.getItem(this.gameName);
        let address = 'ws://cs260.nschulzke.com:4000/api/game/' + this.gameName;
        if (this.token !== undefined) {
          console.log(this.token);
          address += '?access_token=' + this.token;
        }
        this.socket = new WebSocket(address);

        this.socket.addEventListener('message', (event) => {
          let data = JSON.parse(event.data);
          if (data.success === true) {
            this.game = data.game;
            if (data.player <= 1) {
              this.player = data.player;
            } else this.player = false;
            this.hit = data.hit;
            this.chats = data.chats;
            this.token = data.token;
            window.sessionStorage.setItem(this.gameName, this.token);
          }
          else alert(data.error);
        });
      },
    },
  }
</script>
