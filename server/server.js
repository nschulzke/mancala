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
let _containers = {};

app.post('/api/create', function(req, res) {
  if (_containers[req.body.name] === undefined) {
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
  if (_containers[req.body.name] !== undefined) {
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
  if (_containers[name] === undefined) {
    _containers[name] = {
      game: new Mancala(),
      players: [],
      chats: [],
      hit: [],
    }
  }
  let c = _containers[name];
  c.players.push(ws);
  let player = c.players.indexOf(ws);

  ws.send(gameJSON());

  console.log('Sent game');

  ws.on('message', (msg) => {
    console.log('Message received');
    try {
      let data = JSON.parse(msg);
      if (data.action === 'move') {
        if (data.hole !== undefined) {
          c.hit = c.game.move(data.hole, player);
          broadcast();
        } else error('No hole specified to move!');
      } else if (data.action === 'chat') {
        c.chats.push({name: 'Anon' + player, chat: data.chat});
        broadcast();
      } else if (data.action === 'get') {
        ws.send(gameJSON());
      }
    } catch (e) {
      error(e.message)
    };
  });

  ws.on('close', () => {
    if (player === 0)
      c.game.won = 1;
    else if (player === 1)
      c.game.won = 0;
    c.players = c.players.filter(e => e !== ws);
    if (c.game.won !== -1)
      broadcast();
  });

  function error(message) {
    ws.send(JSON.stringify({
      success: false,
      error: message
    }))
  }

  function broadcast() {
    console.log('broadcast');
    c.players.forEach((client) => {
      client.send(gameJSON())
    });
  }

  function gameJSON() {
    return JSON.stringify({
      success: true,
      game: c.game,
      chats: c.chats,
      player: player,
      hit: c.hit,
    });
  }
});

app.listen(3000, () => console.log('Server listening on port 3000!'))
