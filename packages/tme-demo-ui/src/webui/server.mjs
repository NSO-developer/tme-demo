import webpack from 'webpack';
import express from 'express';
import config from './webpack.dev.js';
import httpProxy from 'http-proxy';
import zlib from 'zlib';
import readline from 'readline';
import boxen from 'boxen';
import chalk from 'chalk';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackDevMiddleware from 'webpack-dev-middleware';

const nsoTarget = 'http://localhost:8080';
let fPayload = false;


function addLogging(incomingMessage, direction, method, url) {
  if (fPayload && url.startsWith('/jsonrpc/')) {
    let body = [];
    incomingMessage
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body);
        if (incomingMessage.headers['content-encoding'] == 'gzip') {
          body = zlib.gunzipSync(body);
        }
        const json = JSON.parse(body);
        console.log(chalk.red(direction == 'req' ? 'REQUEST ==>' : 'RESPONSE <=='),
                    chalk.yellow(json.id), '-', method, url);
        console.dir(json, {depth: 4, colors: true});
      });
  }
}

const apiProxy = httpProxy.createProxyServer()
  .on('error', function(err) {
    return console.log(err);
  })
  .on('proxyRes', function(proxyRes, req, res, options) {
    addLogging(proxyRes, 'res', req.method, req.url);
  });

function proxy2nso(req, res) {
  addLogging(req, 'req', req.method, req.url);
  apiProxy.web(req, res, { target: nsoTarget });
}


const compiler = webpack(config);
const app = express()
  .use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
  }))
  .use(webpackHotMiddleware(compiler))
  .all('/', proxy2nso)
  .all('/index.html', proxy2nso)
  .all('/login.html', proxy2nso)
  .all('/jsonrpc/*', proxy2nso)
  .all('/webui-one', proxy2nso)
  .all('/webui-one/*', proxy2nso)
  .all('/dist/*', proxy2nso)
  .all('/login/*', proxy2nso)
  .all('/custom/*', proxy2nso);

app.listen(3000, function(err) {
    if (err) {
      return console.error(err);
    }
    console.log('Listening at http://localhost:3000/');
    console.log();
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
  let usage_text = 'NSO package UI hot update web server\n';
  usage_text += '\n';
  usage_text += 'Key shortcuts:\n';
  usage_text += '  h      - Show usage\n';
  usage_text += '  p      - Enable jsonrpc payload printouts\n';
  usage_text += '  ctrl-c - Quit';
  console.log(boxen(usage_text, {padding: 1, margin: 1, borderStyle: 'double'}));
  console.log();
}

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
  }
});

usage();
