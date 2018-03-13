let app = new Vue({
    el: '#app',
    data: {
        game: {},
    },
    created: function() {
        this.getGame();
    },
    methods: {
        getGame: function () {
            axios.get("/api/game").then(response => {
                this.game = response.data;
                return true;
            }).catch(err => {
            });
        },
    }
});