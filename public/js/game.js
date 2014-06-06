var socket = io()
  , api = 'http://one-night-werewolf-api.quickapps.co.za'
  , currentPlayer
  , currentGame;

var hideInitialInstructions = function(name) {
  $('#intro-message').text('Welcome ' + name);
  $('#intro-instructions').hide();
  $('#name').hide();
  $('#newGameForm').removeClass('hidden');
};

var addSelfToGameLobby = function(game_id) {
  socket.emit('join game lobby', game_id);
};

var changeToInGameMsg = function(game_id) {
  $('#intro-message').text('You are now in game ' + game_id);
}

var hideNewGameBtn = function() {
  $('#newGameForm').hide();
};

var hideStartGameBtn = function() {
  $('#startGameForm').hide();
};

var hideGameList = function() {
  $('#games-lobby').addClass('hidden');
};

var hidePlayerLobby = function() {
  $('#player-lobby').addClass('hidden');
};

var startGame = function(game_id) {
  $.post(api + "/v1/games/" + game_id + "/players.json").done(function (player_data) {
    identifier = player_data.identifier;
    socket.emit('Game started', game_id);
  });
}

function changeToNightPhase(game_id) {
  $("#night-phase").removeClass('hidden');
  $("#player-role").removeClass('hidden');

  $.get(api + '/v1/games/' + game_id + "/players/" + identifier + ".json").done(function (player_data) {
    currentPlayer = player_data;

    if (currentPlayer.doppel_role) {
      $("#player-role").text('You are the Doppel' + currentPlayer.doppel_role)
      $('.role-' + currentPlayer.doppel_role).removeClass('hidden');
    } else {
      $("#player-role").text('You are the ' + currentPlayer.role)
      $('.role-' + currentPlayer.role).removeClass('hidden');
      $('.role-seer').removeClass('hidden');
    }

    $('.name-options').empty();
    $('.name-options').append('<option></option>');

    currentGame.players.forEach(function(player) {
      $('.name-options').append('<option>' + player.name + '</option>');
    });
  });
}

var showStartGameBtn = function() {
  $('#startGameForm').show();
};

var showGameSpecificLobby = function(game_id) {
  $('#game-lobby').removeClass('hidden');
};

var hideGameSpecificLobby = function(game_id) {
  $('#game-lobby').addClass('hidden');
};

var refreshGameSpecificLobby = function(game_id, playerList) {
  playerList.forEach(function(player) {
    $('#game-list').append('<li>' + player + '</li>')
  })
};

var updateGamesList = function(games) {
  $('#games-list').empty();
  games.forEach(function(game) {
    $('#games-list').append('<li class="join-game-link"><a href="#" class="join-game" data-id="' + game + '"> Game ' + game + '</a></li>')
  })

  // Join another person's game
  $('.join-game').on('click', function () {
    alert('hi');
    var game_id = $(this).data('id');
    socket.emit('join existing game', game_id);
    return false;
  });
};

function addSelfToGame(game_id) {
  $.get(api + "/v1/games/" + game_id + ".json").done(function (data) {
    socket.emit('some game data', data)
    $.post(api + "/v1/games/" + game_id + "/players.json").done(function (player_data) {
      socket.emit('set player role', player_data)
    });
  });
}

var removeSelfFromGeneralLobby = function() {
  socket.emit('leave general lobby');
};

var updatePlayerList = function(playerList) {
  $('#player-list').empty();
  playerList.forEach(function(player) {
    $('#player-list').append('<li>' + player.name + '</li>')
  })
}

// Submit a name
$('#nameForm').submit(function() {
  socket.emit('join lobby', $('#name').val());
  return false;
});


// Starting the game
$('#start-game').click(function() {
  hideStartGameBtn();
  hideGameSpecificLobby(game_id);
  changeToInGameMsg(game_id);
  changeToNightPhase(game_id)
  return false;
});

// Doing the night action
$('.do-night-action').click(function() {
  alert('voted');
  socket.emit('player voted', currentGame);
  $('#play_action').hide();
  $('#voted-message').removeClass('hidden');
  $("#player-role").hide();
  return false;
});

// Create new game
$('#newGameForm').click(function(){
  hideNewGameBtn();
  $.post(api + "/v1/games.json").done(function (GamedataFromApi) {
    currentGame = GamedataFromApi;
    game_id = GamedataFromApi.id;
    showStartGameBtn();
    startGame(game_id);
    hideGameList();
    hidePlayerLobby();
    showGameSpecificLobby(game_id);
    addSelfToGameLobby(game_id);
    removeSelfFromGeneralLobby();
    addSelfToGame(game_id);
  });
  return false;
});

// Update list of games
socket.on('game list', function(games) {
  updateGamesList(games);
});

// Update page after name added. Display 'New Game' button.
socket.on('joined lobby', function(name, players, games) {
  hideInitialInstructions(name)

  $('#player-lobby').removeClass('hidden');
  updatePlayerList(players);

  $('#games-lobby').removeClass('hidden');
  updateGamesList(games);
});

socket.on('refresh players', function(players) {
  updatePlayerList(players);
});

// Update specific game lobby with new players
socket.on('game lobby refresh', function(game_id, lobbyNames) {
  refreshGameSpecificLobby(game_id, lobbyNames);
});

// Update players in lobby when someone disconnects
socket.on('player disconnected', function(players) {
  updatePlayerList(players);
});

// function change_to_day() {
//   $.get("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $currentGame.id + "/players/" + currentPlayer.identifier + ".json").done(function (player_data) {
//     $currentPlayer = player_data;
//     if($currentPlayer.saw) {
//       $(".you-saw").text('You saw that ' + $currentPlayer.looked_at + ' is the ' + $currentPlayer.saw)
//     }
//     if($currentPlayer.stole) {
//       $(".you-stole").text('You stole ' + $currentPlayer.stole + ' role of ' + $currentPlayer.stolen_role)
//     }
//     if($currentPlayer.swapped) {
//       $(".you-swapped").text('You swapped ' + $currentPlayer.swapped)
//     }
//     $('#the-werewolves').empty();
//     if($currentPlayer.werewolves) {
//       for (var i = 0; i < $currentPlayer.werewolves.length; i++) {
//         $('#the-werewolves').append('<li>' + $currentPlayer.werewolves[i] + '</li>')
//       }
//       if($currentPlayer.werewolves.length === 0) {
//         $('#the_winners').append('<li>No werewolves</li>')
//       }
//     }
//     $('#the-masons').empty();
//     if($currentPlayer.masons) {
//       for (var i = 0; i < $currentPlayer.masons.length; i++) {
//         $('#the-masons').append('<li>' + $currentPlayer.masons[i] + '</li>')
//       }
//     }
//     if($currentPlayer.current_role) {
//       if($currentPlayer.current_role == $currentPlayer.role) {
//         $(".you-role").text('You are still the ' + $currentPlayer.current_role)
//       } else {
//         $(".you-role").text('You are now the ' + $currentPlayer.current_role)
//       }
//     }
//     $.mobile.changePage("#play_day", { transition: "slideup", changeHash: false });
//   });
// }

// function change_to_done() {
//   $('#the_winners').empty();
//   for (var i = 0; i < $currentGame.winners.length; i++) {
//     winner = $currentGame.winners[i]
//     $('#the_winners').append('<li>' + winner + '</li>')
//   }
//   if($currentGame.winners.length === 0) {
//     $('#the_winners').append('<li>No Winners</li>')
//   }
//   $('#final_results').empty();
//   for (var i = 0; i < $currentGame.players.length; i++) {
//     player = $currentGame.players[i]
//     $('#final_results').append('<tr>' +
//       '<td>' + player.name + '</td>' +
//       '<td>' + player.role + '</td>' +
//       '<td>' + player.voted_for + '</td>' +
//       '<td>' + player.votes_against + '</td>' +
//       '</tr>')
//   }
//   $.mobile.changePage("#play_done", { transition: "slideup", changeHash: false });
// }

// $(document).ready(function () {

//     $.post("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $currentGame.id + "/next-phase.json").done(function (data) {
//       $currentGame = data;
//       check_phase();
//     });
//   });

//     $.ajax({url: "http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $currentGame.id + ".json", cache: false}).done(function (data) {
//       $currentGame = data;
//       check_phase();
//     });
//   });

//   $('#play_action').submit(function (e) {
//     e.preventDefault();
//     var params = {};
//     if ($currentPlayer.role == 'seer') {
//       params = {look_at: $('#look_at_select').val()}
//     }
//     if ($currentPlayer.role == 'robber') {
//       params = {rob: $('#rob_select').val()}
//     }
//     if ($currentPlayer.role == 'troublemaker') {
//       params = {swap: $('#troublemaker_swap1').val() + "," + $('#troublemaker_swap2').val() }
//     }
//     $.post("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $currentGame.id + "/players/" + $currentPlayer.identifier + "/play-action.json",params).done(function (data) {
//       $('#play_action').hide();
//     });
//   });

//   $('#vote').submit(function (e) {
//     e.preventDefault();
//     var params = {name: $('#vote_for').val()};
//     $.post("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $currentGame.id + "/players/" + $currentPlayer.identifier + "/votes.json",params).done(function (data) {
//       $('#vote').hide();
//     });
//   });
// });