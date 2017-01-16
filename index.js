var express = require('express');
var request = require('request');
var ffmpeg = require('fluent-ffmpeg');
var Promise = require('bluebird');

var app = express();

app.get('/', function(req, res) {
  var url = 'http://people.videolan.org/~dionoea/vlc-plugin-demo/streams/sw_8M.mov';

  checkMeta(url)
  .then(function() {
    var proxyPipe = request.get(url).pipe(res);

    var interval = setInterval(function() {
      checkMeta(url)
      .catch(function(err) {
        console.log('catch', err);
        proxyPipe.end();
        clearInterval(interval);
      });
    }, 5000);

    proxyPipe.on('error', function(e){
      console.log(e);
      clearInterval(interval);
    });

    //client quit normally
    req.on('end', function(){
      console.log('end');
      clearInterval(interval);
      proxyPipe.end();
    });

    //client quit unexpectedly
    req.on('close', function(){
      console.log('close');
      clearInterval(interval);
      proxyPipe.end();
    });
  });
});

function checkMeta(url) {
  console.log('checkMeta');

  return new Promise(function(resolve, reject) {
    ffmpeg.ffprobe(url, function(err, data) {
      if (err) {
        return reject(err);
      }
      console.log('data', data);

      if (false) {
        return reject(new Error('Unauthorized'));
      }

      return resolve();
    });
  });
}

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
