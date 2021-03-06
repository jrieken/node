'use strict';
const common = require('../common');
const assert = require('assert');

if (!common.hasCrypto) {
  common.skip('missing crypto');
  return;
}
const tls = require('tls');

const exec = require('child_process').exec;
const fs = require('fs');

var options = {
  key: fs.readFileSync(common.fixturesDir + '/keys/agent2-key.pem'),
  cert: fs.readFileSync(common.fixturesDir + '/keys/agent2-cert.pem'),
  ciphers: 'ECDHE-RSA-RC4-SHA',
  ecdhCurve: false
};

var server = tls.createServer(options, common.fail);

server.listen(0, '127.0.0.1', common.mustCall(function() {
  var cmd = '"' + common.opensslCli + '" s_client -cipher ' + options.ciphers +
            ` -connect 127.0.0.1:${this.address().port}`;

  // for the performance and stability issue in s_client on Windows
  if (common.isWindows)
    cmd += ' -no_rand_screen';

  exec(cmd, common.mustCall(function(err, stdout, stderr) {
    // Old versions of openssl will still exit with 0 so we
    // can't just check if err is not null.
    assert(stderr.includes('handshake failure'));
    server.close();
  }));
}));
