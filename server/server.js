const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('public'));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

let Mancala = require('./model/Mancala.js');
let _game = new Mancala();

app.get('/api/game', (req, res) => {
  res.send(_game);
});

app.post('/api/game/move', (req, res) => {
  try {
    let hit = _game.move(req.body.hole);
    res.send({
      success: true,
      game: _game,
      hit: hit,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message
    })
  }
});

app.listen(3000, () => console.log('Server listening on port 3000!'))
