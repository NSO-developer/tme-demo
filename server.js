var path = require('path');
var webpack = require('webpack');
var express = require('express');
var config = require('./webpack.config');
var httpProxy = require('http-proxy');

var app = express();
var compiler = webpack(config);
var apiProxy = httpProxy.createProxyServer();

var nsoTarget = 'http://localhost:8080';

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));


/*
 * Proxy NSO related request to NSO at localhost:8080
 */

function proxy2nso(req, res) {
  console.log('(p)', req.method, req.url);
  apiProxy.web(req, res, {target: nsoTarget});
}

app.all('/', proxy2nso);
app.all('/index.html', proxy2nso);
app.all('/login.html', proxy2nso);
app.all("/jsonrpc/*", proxy2nso);
app.all("/webui-one", proxy2nso);
app.all("/webui-one/*", proxy2nso);
app.all("/dist/*", proxy2nso);
app.all("/login/*", proxy2nso);
//app.all("/custom/l3vpnui", proxy2nso);
//app.all("/custom/l3vpnui/*", proxy2nso);

app.listen(3000, function(err) {
  if (err) {
    return console.error(err);
  }

  console.log('Listening at http://localhost:3000/');
});
