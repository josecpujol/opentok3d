
var OpenTok = require('opentok');
var express = require('express');
var app = express();


var apiKey;


function sendResponse(res, sessionId) {
  var token = opentok.generateToken(sessionId);
  console.log("Token: " + token);
  res.render('3dLayoutThreeJs.ejs', {
    apiKey: apiKey,
    sessionId: sessionId,
    token: token
  });
}

var roomSessionMap = {}
var opentok;
var init = function (init_done) {
  apiKey = process.env.API_KEY;
  var apiSecret = process.env.API_SECRET;

  if (!apiKey || !apiSecret) {
    console.log('You must specify API_KEY and API_SECRET environment variables');
    process.exit(1);
  }

  console.log("apiKey: " + apiKey);
  console.log("apiSecret: " + apiSecret);
  opentok = new OpenTok(apiKey, apiSecret);

  app.use(express.static(__dirname + '/public'));

  app.get('/:room', function (req, res) {
    var room = req.params.room;
    if (roomSessionMap[room] == null) {
      console.log("First request to room " + room);
      opentok.createSession(function (error, session) {
        if (error) {
          console.log("Error creating session:", error)
          res.send(500);
        } else {
          console.log("Session ID for " + room + ": " + session.sessionId);
          roomSessionMap[room] = session.sessionId;
          sendResponse(res, session.sessionId);
       //   res.send("new session Id: " + session.sessionId);
        }
      });
    } else {
      var sessionId = roomSessionMap[room];
      console.log("Session id for room " + room + " was already created: " + sessionId);
      //res.send("already existing session Id: " + sessionId);
      sendResponse(res, sessionId);
    }
  })

  init_done();
}


function run() {
  var server = app.listen(3000, function() {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
  });
}

init(run);
