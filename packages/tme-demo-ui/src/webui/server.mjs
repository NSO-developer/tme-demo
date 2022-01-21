var path = require('path');
var webpack = require('webpack');
var express = require('express');
var config = require('./webpack.dev.js');
var httpProxy = require('http-proxy');
var http = require('http');
var zlib = require('zlib');
var readline = require('readline');
var boxen = require('boxen');
var chalk = require('chalk');
var bodyParser = require('body-parser');

/*
 * Flags
 */
var fPayload = false;



var app = express();
var compiler = webpack(config);
var apiProxy = httpProxy.createProxyServer();

apiProxy.on('error', function(err) {
    return console.log(err);
});

var nsoTarget = 'http://localhost:8080';

app.use(
  require('webpack-dev-middleware')(compiler, {
    publicPath: config.output.publicPath
  })
);

app.use(require('webpack-hot-middleware')(compiler));

function logReqRes(req, res, next) {
  const oldResWrite = res.write;
  const oldResEnd = res.end;

  const chunks = [];

  res.write = (...restArgs) => {
    chunks.push(new Buffer(restArgs[0]));
    oldResWrite.apply(res, restArgs);
  };

  res.end = (...restArgs) => {
    if (restArgs[0]) {
      chunks.push(new Buffer(restArgs[0]));
    }
    const body = Buffer.concat(chunks);
    var json = body;

    if (fPayload && req.url.startsWith('/jsonrpc/')) {
      const x = new http.OutgoingMessage();
      const outHeadersKey = Object.getOwnPropertySymbols(x)[1];
      var headers = res[outHeadersKey];

      var encoding = headers['content-encoding'];
      var length = headers['content-length'];
      if (encoding && encoding.indexOf('gzip') >= 0) {
        var dezipped = zlib.gunzipSync(body);
        var json_string = dezipped.toString('utf-8');
        json = JSON.parse(json_string);
      }
      var id = json.id > 0 ? `${chalk.yellow(req.body.id)} -` : '-';
      console.log(chalk.red('RESPONSE <=='), id, req.method, req.url);
      console.dir(json, {depth: 4, colors: true});
    }

    oldResEnd.apply(res, restArgs);
  };

  next();
}

app.use(logReqRes);

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// Restream parsed body before proxying
apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
  if(req.body) {
    let bodyData = JSON.stringify(req.body);
    // In case if content-type is application/x-www-form-urlencoded -> we need to change to application/json
    proxyReq.setHeader('Content-Type','application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    // Stream the content
    proxyReq.write(bodyData);
  }
});

/*
 * Proxy NSO related request to NSO at localhost:8080
 */

function proxy2nso(req, res) {
  var req_str = chalk.red('REQUEST ==>');
  req_str += req.body.id > 0 ? ` ${chalk.yellow(req.body.id)} -` : '';
  console.log(req_str, req.method, req.url);
  if (fPayload && req.url.startsWith('/jsonrpc/')) {
      console.dir(req.body, {depth: 4, colors: true});
  }

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
app.all('/custom/*', proxy2nso);

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
  } else if (!key.shift && !key.ctrl && key.name === 'return') {
    console.log();
  } else {
//    console.log(`You pressed the "${str}" key`);
//    console.log();
//    console.log(key);
//    console.log();
  }
});

function togglePayload() {
    fPayload = !fPayload;
    console.log();
    if (fPayload)
        console.log('Payload printouts enabled');
    else
        console.log('Payload printouts disabled');
    console.log();
}

function usage() {
  var usage_text = 'NSO package UI hot update web server\n';
  usage_text += '\n';
  usage_text += 'Key shortcuts:\n';
  usage_text += '  h      - Show usage\n';
  usage_text += '  p      - Enable jsonrpc payload printouts\n';
  usage_text += '  ctrl-c - Quit';
  console.log(boxen(usage_text, {padding: 1, margin: 1, borderStyle: 'double'}));
  console.log();
}

usage();
