/*!
 * TCEC Kibitzer JavaScript v1.0
 * http://github.com/nssy/tcec-kibitzer/
 *
 *
 * Copyright 2014 NssY Wanyonyi
 * Released under the GPL3 license
 * http://github.com/nssy/tcec-kibitzer/Licence.txt
 *
 * Date: 2014-04-20T10:30Z
 */
/* jshint multistr:true */

var ws_url = 'http://localhost:2035'; // Web Service URL
var interval = 1000; // Distance in time (milliseconds) for fetching engine output from the Web Service API (Its not recommeded to set this too low)


var kibitzer_window = '<div id="tcec-kibitzer">\
<div id="tcec-kibitzer-title">\
    <div id="tcec-kibitzer-name"><span id="min-restore">-</span>TCEC Kibitzer</div>\
    <div id="tcec-kibitzer-engines" title="Available Engines"></div>\
    <div id="tcec-kibitzer-source">\
        <select id="tcec-kibitzer-board-source" title="Source Board to Analyze">\
            <option value="main">Main</option>\
            <option value="blackpv">Black PV</option>\
            <option value="whitepv">White PV</option>\
        </select>\
    </div>\
</div>\
<hr>\
<div id="tcec-kibitzer-toolbar">\
    <div id="tcec-kibitzer-button"><b>Start</b></div>\
    <div class="gears"></div>\
</div>\
<div id="tcec-kibitzer-status-toolbar">\
    <div id="tcec-kibitzer-score" title="Score"></div>\
    <div id="tcec-kibitzer-depth" title="Depth/Selected depth"></div>\
    <div id="tcec-kibitzer-best" title="Best Move"></div>\
    <div id="tcec-kibitzer-nps" title="Kilo Nodes per second (KN/s)"></div>\
    <div id="tcec-kibitzer-curr" title="Current move being analyzed"></div>\
    <div id="tcec-kibitzer-tbhits" title="Tablebase hits"></div>\
    <div id="tcec-kibitzer-time" title="Time taken by engine"></div>\
</div>\
<div id="tcec-kibitzer-status">\
    <div id="tcec-kibitzer-pvs"></div>\
    <div id="tcec-kibitzer-msg"></div>\
</div>\
</div>';

var think_icon = chrome.extension.getURL("thinking.gif");
var wait_icon = chrome.extension.getURL("waiting.png");
var online = false; // Returns true if Web Service API is available
var running = false; // Returns true if engine is running
var stepper = null; // Countup setInterval
var tt = 0; // Thinking time taken by engine

// Prints out log information
function status(ok, msg) {
  var span_css;

  if (online === false) {
    ok = false;
    msg += '<br />API Server <a href="' + ws_url + '" target="_blank">' + ws_url + '</a> is offline.';
  }

  if (running === false) {
    ok = false;
    $('#tcec-kibitzer-toolbar .gears img').attr("src", wait_icon);
    msg += ' waiting....';
  }

  if (ok === true) {
    span_css = 'ok';
  } else {
    span_css = 'error';
  }

  var div = document.getElementById("tcec-kibitzer-msg");
  var span_count = div.getElementsByTagName('span').length;
  var span;

  // Maximum lines to display before scrolling
  if (span_count >= 1) {
    span = div.removeChild(div.firstChild);
  } else {
    span = document.createElement("span");
  }

  span.innerHTML = msg;
  span.className = span_css;
  div.appendChild(span);

  // Always scrolls to the bottom
  div.scrollTop = div.scrollHeight;
}

// Updates pv info on our window
function pv_status(num, score, pv, currmoveno, bounds) {
  var div = document.getElementById("tcec-kibitzer-pvs");
  var span = document.getElementById("tcec-kibitzer-pv" + num);
  var text = num + '. (' + score + ') ' + pv;

  if (!span) {
    span = document.createElement("span");
    span.id = "tcec-kibitzer-pv" + num;
  }

  span.className = '';

  if (num == currmoveno) {
    span.className = 'active';
  }

  switch (bounds) {
  case 1:
    span.className += ' fail-low';
    break;
  case -1:
    span.className += ' fail-high';
    break;
  default:
  case 0:
    break;
  }

  span.title = "PV " + num;
  span.innerHTML = text;
  div.appendChild(span);
}

// Clears pv info on our window
function clear_pv() {
  var div = document.getElementById("tcec-kibitzer-pvs");
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }
}

// Fetches & displays the current engine output from the Web Service API
function periodic_output() {
  if (online === false) {
    status(false, 'Not connected to Web Service API..');
    return;
  }

  if (running === false) {
    status(false, 'stopped..');
    return;
  }

  // Get engine output
  $.ajax(ws_url + '/output', {
    timeout: 10000,
    error: function () {
      status(false, 'Error getting engine output ...');
      if (retries == 3) {
        do_reset();
        online = false;
        running = false;
      }
      retries++;
    },
    success: function (json) {
      retries = 0;
      if (json.status && json.data) {

        if (typeof json.data.score[1] !== "undefined") {

          var score_div = document.getElementById("tcec-kibitzer-score");
          score_div.className = '';
          if (typeof json.data.bounds[1] !== "undefined") {
            switch (json.data.bounds[1]) {
            case 1:
              score_div.className += ' fail-low';
              break;
            case -1:
              score_div.className += ' fail-high';
              break;
            default:
            case 0:
              break;
            }
          }
          score_div.innerHTML = json.data.score[1];
        }

        if (json.data.depth) {
          var d = json.data.depth;
          if (json.data.seldepth) {
            d += '/' + json.data.seldepth;
          }

          document.getElementById("tcec-kibitzer-depth").innerHTML = d;
        } else {
          document.getElementById("tcec-kibitzer-depth").innerHTML = '';
        }

        if (typeof json.data.pv[1] !== "undefined") {
          document.getElementById("tcec-kibitzer-best").innerHTML = json.data.pv[1].split(' ')[0];
        } else {
          document.getElementById("tcec-kibitzer-best").innerHTML = '';
        }

        if (json.data.nps) {
          document.getElementById("tcec-kibitzer-nps").innerHTML = pretty_number(Math.round(json.data.nps / 1000)) + ' KN/s';
        } else {
          document.getElementById("tcec-kibitzer-nps").innerHTML = '';
        }

        if (json.data.time) {
          // only update time if engine time is more
          if (tt < json.data.time) {
            tt = Math.round(json.data.time);
          }
        }

        // Use a countup
        if (!stepper) {
          stepper = window.setInterval(function () {
            document.getElementById("tcec-kibitzer-time").innerText = secs_time(tt);
            if (running) {
              return tt++;
            }
            tt = 0;
          }, 1000);
        }

        if (json.data.currmoveno) {
          document.getElementById("tcec-kibitzer-curr").innerHTML = json.data.currmoveno;
        } else {
          document.getElementById("tcec-kibitzer-curr").innerHTML = '';
        }

        if (json.data.tbhits) {
          var tbhits;
          if (json.data.tbhits < 10000) {
            tbhits = json.data.tbhits;
          } else if (json.data.tbhits < 1000000) {
            tbhits = pretty_number((json.data.tbhits / 1000).toFixed(2) + ' K');
          } else {
            tbhits = (json.data.tbhits / 1000000).toFixed(3) + ' M';
          }

          document.getElementById("tcec-kibitzer-tbhits").innerHTML = tbhits;
        } else {
          document.getElementById("tcec-kibitzer-tbhits").innerHTML = '';
        }

        // PV info
        if (json.data.pv) {
          for (var i in json.data.pv) {
            if (typeof json.data.score[i] !== "undefined" &&
              typeof json.data.pv[i] !== "undefined" &&
              typeof json.data.bounds[i] !== "undefined") {
              pv_status(i, json.data.score[i], json.data.pv[i], json.data.currmoveno, json.data.bounds[i]);
            }
          }
        }
      }

      // Recursion
      setTimeout(periodic_output, interval);
    }
  });
}

// Gets fen from the chess board and send to Web Service API
function set_position() {
  var fen;
  if (running === false) {
    return;
  }

  // Figure out which board to analyze from the dropdown
  var cur_source = $("#tcec-kibitzer-source select").val();
  if (cur_source == 'main') {
    fen = document.getElementById("CurrentFEN").innerText;
  }

  if (fen === '') {
    status(false, 'Unable to get fen for this board');
    return;
  }

  // Send position to engine via our Web Service API
  $.ajax(ws_url + '/position', {
    data: {
      'fen': fen,
      'source': cur_source
    },
    dataType: 'json',
    timeout: 5000,
    error: function () {
      online = false;
      online = running;
      status(false, 'Failed to connect to Web Service API');
    },
    beforeSend: function () {
      status(true, 'Setting up position...');
    },
    success: function (json) {
      tt = 0; // Reset engine thinking time

      // Check Status
      if (json.status) {
        // Analyzing
        clear_pv();
        $('#tcec-kibitzer-toolbar .gears img').attr("src", think_icon);
        status(true, json.message + ' from ' + json.source + ' Board<br /><b class="bright">Thinking (' + json.fen + ')</b>');
      } else {
        // Not analyzing
        $('#tcec-kibitzer-toolbar .gears img').attr("src", wait_icon);
        status(false, 'API failed to setup the position');
      }
    }
  });
}

// Creates the engines dropdown
function set_engines_dropdown(engines) {
  var div = document.getElementById("tcec-kibitzer-engines");
  var select = document.getElementById("tcec-kibitzer-engine-options");
  var opt;

  if (!select) {
    select = document.createElement("select");
    select.id = "tcec-kibitzer-engine-options";
    select.onchange = function () {
      set_engine(this.options[this.selectedIndex].value);
    };
  }

  for (var i = 0; i < engines.length; i++) {
    if (engines[i]) {
      var opt_id = "tcec-kibitzer-engine-option-";
      opt_id += engines[i].name.replace(/[^a-zA-Z0-9\._]/g, '-').replace(/[\-]+/g, '-').replace(/[\-]+$/g, '').toLowerCase();
      opt = document.getElementById(opt_id);
      if (!opt) {
        opt = document.createElement("option");
        opt.value = i;
        opt.innerHTML = engines[i].name;
        opt.id = opt_id;
        select.appendChild(opt);
      }
    }
  }

  div.appendChild(select);
}

// Sends the selected engine to the Web Service  API
function set_engine(engine) {
  $.ajax(ws_url + '/engine', {
    data: {
      'engine_no': engine
    },
    dataType: 'json',
    timeout: 5000,
    error: function () {
      online = false;
      status(false, 'Failed to connect to Web Service API');
    },
    beforeSend: function () {
      status(true, 'Changing engine ...');
    },
    success: function (json) {
      // Check Status
      if (json.status) {
        // New Engine set
        status(true, status.message);
        set_position();
      } else {
        // Failed to setup engine
        $('#tcec-kibitzer-toolbar .gears img').attr("src", wait_icon);
        status(true, 'API failed to setup selected engine');
      }
    }
  });
}

// converts seconds to human readable time duration
function secs_time(secs) {
  var hours = parseInt(secs / 3600) % 24;
  var minutes = parseInt(secs / 60) % 60;
  var seconds = secs % 60;

  if (hours > 0) {
    hours = (hours < 10 ? "0" + hours : hours) + ":";
  } else {
    hours = '';
  }

  return hours + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
}

// converts 1023100.00 to 1,023,100.00
function pretty_number(num) {
  return (num + "").replace(/.(?=(?:[0-9]{3})+\b)/g, '$&,');
}

// reset (Just stops engine)
function do_reset() {
  // Stop our analysis
  running = false;
  $('#tcec-kibitzer-toolbar .gears img').attr("src", wait_icon);
  $('#tcec-kibitzer-button').text('Start');
  tt = 0; // Reset engine thinking time

  // Ask our Web Service API to reset (Stop engine)
  $.get(ws_url + '/reset?', function (data) {
    status(true, data.message);
  });
}

/* Main
 * (Get Started)
 */
$('body').append(kibitzer_window);
$('#tcec-kibitzer-toolbar .gears').append('<img src="' + wait_icon + '" />');

// Set the position again
document.getElementById('tcec-kibitzer-board-source').onchange = function () {
  set_position();
};

// Ask our Web Service API to change moves notation type
document.getElementById('tcec-kibitzer-best').onclick = function () {
  $.get(ws_url + '/notation?', function (data) {
    status(true, data.message);
  });
};

// Start/Stop Button Logic
var retries = 0;
$("#tcec-kibitzer-button").click(function () {
  if (running) {
    do_reset();
  } else {

    var eng_select = document.getElementById("tcec-kibitzer-engine-options");
    var engine_no = 0;
    if (eng_select) {
      engine_no = eng_select.options[eng_select.selectedIndex].value;
    }

    // Start our analysis
    $.ajax(ws_url + '/start', {
      timeout: 5000,
      data: {
        'engine_no': engine_no
      },
      dataType: 'json',
      error: function () {
        online = false;
        running = false;
        status(false, 'Failed to start API');
      },
      success: function (json) {
        online = true;
        running = true;
        tt = 0; // Reset engine thinking time

        $('#tcec-kibitzer-button').text('Stop');
        $('#tcec-kibitzer-pvs').empty();

        status(true, json.message);

        // Create/Update engines dropdown
        if (json.engines) {
          set_engines_dropdown(json.engines);
          // Show current selected engine
          eng_select = document.getElementById("tcec-kibitzer-engine-options");
          if (eng_select) {
            eng_select.selectedIndex = json.engine_no;
          }
        }

        // Set the position
        set_position();

        // Start the output updater
        periodic_output();
      }
    });
  }
});

// Toggles minimalistic view
$("#tcec-kibitzer-name").click(function () {
  var min_restore = $('#min-restore');
  $("#tcec-kibitzer-status").slideToggle(300, function () {
    if ($(min_restore).html() == "-") {
      $(min_restore).fadeOut(30, function () {
        $(this).html("+");
      })
        .fadeIn(10);
    } else {
      $(min_restore).fadeOut(30, function () {
        $(this).html("-");
      })
        .fadeIn(10);
    }
  });
});

/*
http://dev.opera.com/articles/view/mutation-observers-tutorial/
https://developer.mozilla.org/en/docs/Web/API/MutationObserver
https://code.google.com/p/mutation-summary/
*/

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function (mutations, observer) {
  // fired when a mutation occurs
  mutations.forEach(function (mutation) {
    if (mutation.oldValue != mutation.target.nodeValue) {
      set_position();
    }
  });
});

var elem = document.getElementById("CurrentFEN");
// define what element should be observed by the observer
// and what types of mutations trigger the callback
observer.observe(elem, {
  subtree: true,
  characterData: true,
  characterDataOldValue: true
});
