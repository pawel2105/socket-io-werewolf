var express = require('express')
      , app = express()
      , server = require('http').createServer(app)
      , io = require("socket.io").listen(server)
      , api = 'http://one-night-werewolf-api.quickapps.co.za'
      , players = []
      , genLobbyPlayers = []
      , games = []
      , gameLobbies = [];

app.use(express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/js'));

app.get('/', function(req, res) {
  res.render('index.html');
});

io.on('connection', function(socket) {
  socket.on('disconnect', function() {
    players[socket.id] = null;
    socket.emit('player disconnected', players);
  });

  socket.on('join lobby', function(name) {
    players.push({ 'socket_id': socket.id, name: name});
    genLobbyPlayers.push({ 'socket_id': socket.id, name: name});
    socket.emit('joined lobby', name, genLobbyPlayers, games);
    io.emit('refresh players', genLobbyPlayers);
  });

  // DELETE THIS WHEN DONE, JUST FOR DEBUG
    socket.on('some game data', function(data) {
      console.log(data);
    });
  // END OF DELETE

  socket.on('set player role', function(data) {
    data.name;
    data.game_id;
    data.identifier;
    console.log(data);
  });

  socket.on('player voted', function(game) {
    // console.log(game);
    // console.log(game.id);
  });

  socket.on('leave general lobby', function() {
    newGenLobby = []
    genLobbyPlayers.forEach(function(player) {
      if (player['socket_id'] == socket.id) {
        //
      } else {
        newGenLobby.push(player);
      }
    });

    genLobbyPlayers = newGenLobby;
    io.emit('refresh players', genLobbyPlayers);
  });

  socket.on('Game started', function(game_id, player_identifier) {
    games.push(game_id);
    io.emit('game list', games);
  });

  socket.on('join existing game', function(link_id) {
    console.log(link_id);
  });

  socket.on('join game lobby', function(game_id) {
    players.forEach(function(player) {
      if (player['socket_id'] == socket.id) {
        player_identifier = player.name;
      }
    });

    theLobby = gameLobbies[''+game_id];
    if (theLobby) {
      newLobby = theLobby.push(player_identifier);
      theLobby = newLobby;
      gameLobbies.push(newLobby);
    } else {
      gameLobbies[''+game_id] = [player_identifier];
      theLobby = gameLobbies[''+game_id];
    }
    io.emit('game lobby refresh', game_id, theLobby)
  });
});

server.listen(3000, function() {
  console.log('listening on *:3000');
});