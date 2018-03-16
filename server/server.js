const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const bodyParser = require('body-parser');
const crypto = require('crypto');
const url = require('url');
const WebSocket = require('ws');

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
  try {
    console.log('New connection');

    const location = url.parse(req.url, true);

    let gameName = req.params.game;
    if (_containers[gameName] === undefined) {
      let game = new Mancala();
      _containers[gameName] = {
        game: game,
        count: 0,
        players: [],
        chats: [],
        hit: [],
      }
      game.setWinListener((player) => {
        if (_containers[gameName].players[player] !== undefined)
          sysChat(_containers[gameName].players[player].name + ' won the game!');
        else sysChat('Player ' + (player + 1) + ' won the game!');
        broadcast();
      });
    }
    let c = _containers[gameName];

    let playerName;
    if (c.count <= 1)
      playerName = 'Player ' + (c.count + 1);
    else
      playerName = 'Observer ' + (c.count - 1);
    let player;
    if (location.query.access_token !== undefined) {
      let matched = c.players.filter((p) => p.token === location.query.access_token);
      if (matched.length > 0) {
        player = matched[0];
        player.timingOut = false;
        clearTimeout(player.timeout);
        player.socket = ws;
        console.log('Connection resumed.');
        sysChat(player.name + ' reconnected!');
      }
    }
    if (player === undefined) {
      player = c.players[c.count] = {
        id: c.count++,
        name: playerName,
        socket: ws,
        token: crypto.randomBytes(48).toString('hex'),
      };
      sysChat(player.name + ' joined the game.');
    }
    player.pingPong = setInterval(ping, 5000);

    broadcast();

    ws.on('message', (msg) => {
      console.log('Message received');
      try {
        let data = JSON.parse(msg);
        if (data.action === 'move') {
          if (data.hole !== undefined) {
            c.hit = c.game.move(data.hole, player.id);
            broadcast();
          } else error('No hole specified to move!');
        } else if (data.action === 'chat') {
          c.chats.push({
            name: player.name,
            chat: data.chat
          });
          broadcast();
        } else if (data.action === 'get') {
          ws.send(gameJSON());
        }
      } catch (e) {
        error(e.message)
      };
    });

    ws.on('close', () => {
      console.log('Connection closed, waiting for reconnect.');
      player.timingOut = true;
      let timeout = 5000;
      if (player.id <= 1) {
        sysChat(player.name + ' lost connection. Waiting...');
        broadcast();
        timeout = 10000;
      }
      player.timeout = setTimeout(() => {
        if (player.timingOut === true) {
          console.log('Connection reconnect timed out.');
          sysChat(player.name + ' left the game.');
          if (player.id === 0) {
            c.game.victory(1);
          } else if (player.id === 1) {
            c.game.victory(0);
          }
          c.players = c.players.filter(e => e !== player);
          broadcast();
          if (c.players.length === 0) {
            _containers[gameName] = undefined;
          }
        }
      }, timeout);
    });

    function error(message) {
      ws.send(JSON.stringify({
        success: false,
        error: message
      }))
    }

    ws.on('pong', () => {
      clearTimeout(player.ping);
    });

    function ping() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
        player.ping = setTimeout(() => {
          lostConnection();
        }, 5000);
      } else lostConnection();
    }

    function lostConnection() {
      clearInterval(player.pingPong);
      clearTimeout(player.ping);
      if (player.socket._socket)
        player.socket._socket.destroy();
    }

    function broadcast() {
      c.players.forEach((p) => {
        if (p.socket.readyState === WebSocket.OPEN)
          p.socket.send(gameJSON(p))
      });
    }

    function sysChat(message) {
      c.chats.push({
        name: 'System',
        chat: message
      });
    }

    function gameJSON(p) {
      if (p === undefined) p = player;
      return JSON.stringify({
        success: true,
        game: c.game,
        chats: c.chats,
        hit: c.hit,
        player: p.id,
        token: p.token,
      });
    }
  } catch (e) {
    console.log(e);
  }
});

app.listen(4000, () => console.log('Server listening on port 4000!'))
