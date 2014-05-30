var $current_game, $current_player, $last_phase;

function change_to_new() {
  $("h1").text($current_game.id + ' : ' + $current_player.name)
  $.mobile.changePage("#play", { transition: "slideup", changeHash: false });
}

function change_to_night() {
  $.get("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $current_game.id + "/players/" + $current_player.identifier + ".json").done(function (player_data) {
    $current_player = player_data;
    if($current_player.doppel_role) {
      $(".your-role").text('You are the Doppel ' + $current_player.doppel_role)
    } else {
      $(".your-role").text('You are the ' + $current_player.role)
    }
    $('.roles').hide();
    $('.role-' + $current_player.role).show();
    $('.role-' + $current_player.doppel_role).show();
    $('.name-options').empty();
    $('.name-options').append('<option></option>');
    for (var i = 0; i < $current_game.players.length; i++) {
      $('.name-options').append('<option>' + $current_game.players[i].name + '</option>')
    }
    $.mobile.changePage("#play_night", { transition: "slideup", changeHash: false });
  });
}

function change_to_day() {
  $.get("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $current_game.id + "/players/" + $current_player.identifier + ".json").done(function (player_data) {
    $current_player = player_data;
    if($current_player.saw) {
      $(".you-saw").text('You saw that ' + $current_player.looked_at + ' is the ' + $current_player.saw)
    }
    if($current_player.stole) {
      $(".you-stole").text('You stole ' + $current_player.stole + ' role of ' + $current_player.stolen_role)
    }
    if($current_player.swapped) {
      $(".you-swapped").text('You swapped ' + $current_player.swapped)
    }
    $('#the-werewolves').empty();
    if($current_player.werewolves) {
      for (var i = 0; i < $current_player.werewolves.length; i++) {
        $('#the-werewolves').append('<li>' + $current_player.werewolves[i] + '</li>')
      }
      if($current_player.werewolves.length === 0) {
        $('#the_winners').append('<li>No werewolves</li>')
      }
    }
    $('#the-masons').empty();
    if($current_player.masons) {
      for (var i = 0; i < $current_player.masons.length; i++) {
        $('#the-masons').append('<li>' + $current_player.masons[i] + '</li>')
      }
    }
    if($current_player.current_role) {
      if($current_player.current_role == $current_player.role) {
        $(".you-role").text('You are still the ' + $current_player.current_role)
      } else {
        $(".you-role").text('You are now the ' + $current_player.current_role)
      }
    }
    $.mobile.changePage("#play_day", { transition: "slideup", changeHash: false });
  });
}

function change_to_voting() {
  $.mobile.changePage("#play_voting", { transition: "slideup", changeHash: false });
}

function change_to_done() {
  $('#the_winners').empty();
  for (var i = 0; i < $current_game.winners.length; i++) {
    winner = $current_game.winners[i]
    $('#the_winners').append('<li>' + winner + '</li>')
  }
  if($current_game.winners.length === 0) {
    $('#the_winners').append('<li>No Winners</li>')
  }
  $('#final_results').empty();
  for (var i = 0; i < $current_game.players.length; i++) {
    player = $current_game.players[i]
    $('#final_results').append('<tr>' +
      '<td>' + player.name + '</td>' +
      '<td>' + player.role + '</td>' +
      '<td>' + player.voted_for + '</td>' +
      '<td>' + player.votes_against + '</td>' +
      '</tr>')
  }
  $.mobile.changePage("#play_done", { transition: "slideup", changeHash: false });
}

function check_phase() {
  if($last_phase !== $current_game.state) {
    $last_phase = $current_game.state;
    if($current_game.state === 'new') {
      change_to_new();
    }
    if($current_game.state === 'night') {
      change_to_night();
    }
    if ($current_game.state === 'day') {
      change_to_day();
    }
    if ($current_game.state === 'voting') {
      change_to_voting();
    }
    if ($current_game.state === 'done') {
      change_to_done();
    }
  } else {
    $.mobile.loading( "hide" );
  }

  if($current_game.state == 'new') {
    $('#players_names').empty();
    for (var i = 0; i < $current_game.players.length; i++) {
      $('#players_names').append('<li>' + $current_game.players[i].name + '</li>')
    }
  }
}

$(document).ready(function () {
  $('#new_game').submit(function (e) {
    e.preventDefault();
    $.post("http://one-night-werewolf-api.quickapps.co.za/v1/games.json").done(function (data) {
      $current_game = data;
      $('.player').hide();
      $('.host').show();
      $.post("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $current_game.id + "/players.json",
        { 'name': $('#new_game_name').val() }).done(function (player_data) {
          $current_player = player_data;
          check_phase();
        });
    });
  });

  $('#join').submit(function (e) {
    e.preventDefault();
    $.get("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $('#join_number').val() + ".json").done(function (data) {
      $current_game = data;
      $('.player').show();
      $('.host').hide();
      $.post("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $current_game.id + "/players.json",
        { 'name': $('#join_name').val() }).done(function (player_data) {
          $current_player = player_data;
          check_phase();
        });
    });
  });

  $('.next-phase').submit(function (e) {
    e.preventDefault();
    $.mobile.loading( "show", {
      text: "Loading",
      textVisible: true,
      theme: "a",
      html: ""
    });

    $.post("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $current_game.id + "/next-phase.json").done(function (data) {
      $current_game = data;
      check_phase();
    });
  });

  $('.ready').submit(function (e) {
    e.preventDefault();
    $.mobile.loading( "show", {
      text: "Checking",
      textVisible: true,
      theme: "a",
      html: ""
    });

    $.ajax({url: "http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $current_game.id + ".json", cache: false}).done(function (data) {
      $current_game = data;
      check_phase();
    });
  });

  $('#play_action').submit(function (e) {
    e.preventDefault();
    var params = {};
    if ($current_player.role == 'seer') {
      params = {look_at: $('#look_at_select').val()}
    }
    if ($current_player.role == 'robber') {
      params = {rob: $('#rob_select').val()}
    }
    if ($current_player.role == 'troublemaker') {
      params = {swap: $('#troublemaker_swap1').val() + "," + $('#troublemaker_swap2').val() }
    }
    $.post("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $current_game.id + "/players/" + $current_player.identifier + "/play-action.json",params).done(function (data) {
      $('#play_action').hide();
    });
  });

  $('#vote').submit(function (e) {
    e.preventDefault();
    var params = {name: $('#vote_for').val()};
    $.post("http://one-night-werewolf-api.quickapps.co.za/v1/games/" + $current_game.id + "/players/" + $current_player.identifier + "/votes.json",params).done(function (data) {
      $('#vote').hide();
    });
  });
});