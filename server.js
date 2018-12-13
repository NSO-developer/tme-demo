var path = require('path');
var webpack = require('webpack');
var express = require('express');
var config = require('./webpack.dev.js');
var httpProxy = require('http-proxy');
var readline = require('readline')
var boxen = require('boxen');

var app = express();
var compiler = webpack(config);
var apiProxy = httpProxy.createProxyServer();

var nsoTarget = 'http://localhost:8080';

app.use(
  require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath
  })
);

app.use(require('webpack-hot-middleware')(compiler));

/*
 * Proxy NSO related request to NSO at localhost:8080
 */

function proxy2nso(req, res) {
  console.log('(p)', req.method, req.url);
  apiProxy.web(req, res, { target: nsoTarget });
}

app.all('/', proxy2nso);
app.all('/index.html', proxy2nso);
app.all('/login.html', proxy2nso);
app.all('/jsonrpc/*', proxy2nso);
app.all('/webui-one', proxy2nso);
app.all('/webui-one/*', proxy2nso);
app.all('/dist/*', proxy2nso);
app.all('/login/*', proxy2nso);
//app.all("/custom/l3vpnui", proxy2nso);
//app.all("/custom/l3vpnui/*", proxy2nso);

app.listen(3000, function(err) {
  if (err) {
    return console.error(err);
  }

  console.log('Listening at http://localhost:3000/');
  console.log();
});

/*
 * Setup key events handling
 */

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);


process.stdin.on('keypress', (str, key) => {
  if (!key.shift && key.ctrl && key.name === 'c') {
    process.exit();
  } else if (!key.shift && !key.ctrl && key.name === 'h') {
    usage();
  } else if (!key.shift && !key.ctrl && key.name === 'p') {
    togglePayload();
  } else {
    console.log(`You pressed the "${str}" key`);
    console.log();
    console.log(key);
    console.log();
  }
});

var fPayload = false;
function togglePayload() {
    fPayload = !fPayload;
    if (fPayload)
        console.log("Payload printouts enabled");
    else
        console.log("Payload printouts disabled");
}

function usage() {
  var usage_text = "NSO package UI hot update web server\n";
  usage_text += "\n";
  usage_text += "Key shortcuts:\n";
  usage_text += "  h      - Show usage\n";
  usage_text += "  p      - Enable jsonrpc payload printouts (to be impl.)\n";
  usage_text += "  ctrl-c - Quit";
  console.log(boxen(usage_text, {padding: 1, margin: 1, borderStyle: 'double'}));
  console.log();
}

usage();
