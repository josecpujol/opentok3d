
var webpage; // To be preloaded in the initialization
var apiKey;
function getChatPage(sessionId, token) {
  // Do some substitutions here
  // %APIKEY%
  // %SESSIONID%
  // %TOKEN%
  var new_webpage = webpage.toString();
  return new_webpage.replace(/%APIKEY%/g, apiKey)
   .replace(/%SESSIONID%/g, sessionId)
   .replace(/%TOKEN%/g, token);
}

function sendResponse(response, sessionId) {
  response.writeHead(200, {"Content-Type" : "text/html"});
  // Generate a token.
  var tokenOptions = {};
  tokenOptions.role = "publisher";

  var token = opentok.generateToken(sessionId, tokenOptions);
  console.log("Token: " + token);
  var page = getChatPage(sessionId, token);
  response.end(page);
}

var urlSessionMap = {}
var opentok;
var init = function (init_done) {
  var OpenTok = require('opentok');
  apiKey = process.env.API_KEY;
  var apiSecret = process.env.API_SECRET;
  console.log("apiKey: " + apiKey);
  console.log("apiSecret: " + apiSecret);
  opentok = new OpenTok(apiKey, apiSecret);
  
  // Preload html page to serve it from memory
  var fs = require('fs');
  fs.readFile('./chat.html', function (err, html) {
    if (err) {
      throw err;
    }
    webpage = html;
    init_done();
  });
}

var init_done = function () {
  run();
}

function run() {  
  var http = require('http');
  var server = http.createServer(function (request, response) {
      var url = request.url;
      if (url == "/" || url == "/favicon.ico") {
        response.writeHead(200);
        response.end();
        return;
      }

      if (urlSessionMap[url] == null) {
        console.log("First request to room " + url);
        console.log("Creating session id");
        opentok.createSession(function (error, session) {
          if (error) {
            console.log("Error creating session:", error)
          } else {
            console.log("Session ID for " + url + ": " + session.sessionId);
            urlSessionMap[url] = session.sessionId;
            sendResponse(response, session.sessionId);
          }
        });
      } else {
        console.log("Session id for room " + url + " was already created: " + urlSessionMap[url]);
        sendResponse(response, urlSessionMap[url]);
      }
    });
  server.listen(8000);
  console.log("Server running at http://127.0.0.1:8000/");
}

init(init_done);
