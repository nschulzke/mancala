const HOLES = 14;
const P1_DEST = HOLES / 2;
const P2_DEST = 0;
const START_STONES = 4;
const P1 = 0;
const P2 = 1;

module.exports = class Mancala {
    constructor() {
        this.holes = [];
        for (let i = 0; i < HOLES; i++) {
            this.holes[i] = START_STONES;
        }
        this.holes[P1_DEST] = 0;
        this.holes[P2_DEST] = 0;
        this.turn = P1;
    }

    move(hole) {
        if (this.holeBelongsTo(hole, this.turn)) {
            let stones = this.holes[hole];
            let counter = hole;
            this.holes[hole] = 0;
            while (stones > 0) {
                counter++;
                counter = counter % HOLES;
                this.holes[counter]++;
                stones--;
            }
            if (!this.isDestHole(counter))
                this.switchTurn();
        } else throw new Error("That hole does not belong to the current player.");
    }

    holeBelongsTo(hole, player) {
        if (player === P1) {
            return hole < P1_DEST && hole > 0;
        } else if (player === P2) {
            return hole < HOLES && hole > P1_DEST;
        } else return false;
    }

    isDestHole(hole) {
        return hole === P1_DEST || hole === P2_DEST;
    }

    switchTurn() {
        this.turn = this.turn === P1 ? P2 : P1;
    }
}