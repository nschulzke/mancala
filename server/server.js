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
let _games = {};
let _players = {};

app.post('/api/create', function(req, res) {
  if (_games[req.body.name] === undefined) {
    res.send({
      success: true,
      url: '/api/game/' + req.body.name
    });
  } else {
    res.send({
      success: false,
      error: 'A game with the name ' + req.body.name + ' already exists!'
    })
  }
});

app.post('/api/join', function(req, res) {
  if (_games[req.body.name] !== undefined) {
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
  console.log('New connection');

  let name = req.params.game;
  if (_games[name] === undefined) {
    _games[name] = new Mancala();
    _players[name] = [];
  }
  let game = _games[name];
  _players[name].push(ws);

  ws.send(gameJSON());

  console.log('Sent game');

  ws.on('message', (msg) => {
    console.log('Message received');
    try {
      let data = JSON.parse(msg);
      if (data.action === 'move') {
        if (data.hole !== undefined) {
          let hit = game.move(data.hole, _players[name].indexOf(ws));
          broadcast(hit);
        } else error('No hole specified to move!');
      } else if (data.action === 'get') {
        ws.send(gameJSON());
      }
    } catch (e) {
      error(e.message)
    };
  });

  ws.on('close', () => {
    if (_players[name].indexOf(ws) === 0)
      _games[name].won = 1;
    else if (_players[name].indexOf(ws) === 1)
      _games[name].won = 0;
    _players[name] = _players[name].filter(e => e !== ws);
    if (_games[name].won !== -1)
      broadcast();
  });

  function error(message) {
    ws.send(JSON.stringify({
      success: false,
      error: message
    }))
  }

  function broadcast(hit) {
    console.log('broadcast');
    _players[name].forEach((client) => {
      client.send(gameJSON(hit))
    });
  }

  function gameJSON(hit) {
    return JSON.stringify({
      success: true,
      game: game,
      player: _players[name].indexOf(ws),
      hit: hit
    });
  }
});

app.listen(3000, () => console.log('Server listening on port 3000!'))
