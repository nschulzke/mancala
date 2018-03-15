const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('public'));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

let Mancala = require('./model/Mancala.js');
let _game = new Mancala();
let _games = [];
let _players = [];

app.post('/api/create', function(req, res) {
  if (!_games.includes(req.body.name)) {
    res.send({
      success: true,
      url: '/api/game/' + req.body.name
    });
  } else {
    console.log('created!');
    res.send({
      success: false,
      error: 'A game with the name ' + req.body.name + ' already exists!'
    })
  }
});

app.post('/api/join', function(req, res) {
  if (_games.includes(req.body.name)) {
    res.send({
      success: true,
      url: '/api/game/' + req.body.name
    });
  } else {
    res.send({
      success: false,
      error: 'A game with the name ' + req.body.name + ' does not exist!'
    })
  }
});

app.ws('/api/game/:game', function(ws, req) {
  let game;

  if (_games[req.game] === undefined) {
    game = _games[req.game] = new Mancala();
    _players[req.game] = [];
  } else {
    game = _games[req.game];
  }

  console.log('New connection');
  _players[req.game].push(ws);
  ws.send(JSON.stringify({
    success: true,
    game: game
  }));

  ws.on('message', (msg) => {
    console.log('Message received');
    try {
      let data = JSON.parse(msg);
      if (data.action === 'move') {
        if (data.hole !== undefined) {
          let hit = game.move(data.hole);
          _players[req.game].forEach((client) => {
            client.send(JSON.stringify({
              success: true,
              game: game,
              hit: hit,
            }));
          });
        } else {
          ws.send(JSON.stringify({
            success: false,
            error: 'No hole specified to move!'
          }));
        }
      } else if (data.action === 'get') {
        ws.send(JSON.stringify({
          success: true,
          game: game
        }));
      }
    } catch (e) {
      ws.send(JSON.stringify({
        success: false,
        error: e.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('Connection lost');
    _players[req.game] = _players[req.game].filter(e => e !== ws);
  });
});

app.listen(3000, () => console.log('Server listening on port 3000!'))
