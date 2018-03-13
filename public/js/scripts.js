let app = new Vue({
  el: '#app',
  data: {
    game: {},
    hit: [],
    holes: [13, 12, 11, 10, 9, 8, 1, 2, 3, 4, 5, 6],
  },
  created: function() {
    this.getGame();
  },
  methods: {
    getGame: function() {
      axios.get("/api/game").then(response => {
        this.game = response.data;
        return true;
      }).catch(err => {});
    },
    click: function(i) {
      this.hit = [];
      axios.post("/api/game/move", {
        hole: i
      }).then(response => {
        if (response.data.success !== undefined && response.data.success === true) {
          this.game = response.data.game;
          this.hit = response.data.hit;
          return true;
        } else if (response.data.error !== undefined) {
          alert(response.data.error);
        } else alert("Error contacting server!");
      }).catch(err => {});
    },
    isTurn: function(i) {
      return this.game.turn === i;
    },
    classes: function(i) {
      return {
        hit: this.hit.includes(i),
        player1: i > 0 && i < 7,
        player2: i > 7 && i < 14,
      }
    }
  },
});
