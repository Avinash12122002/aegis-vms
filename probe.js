import net from 'net';
import crypto from 'crypto';

function md5(str) { return crypto.createHash('md5').update(str).digest('hex'); }

function probe(subtype) {
  return new Promise((resolve) => {
    const uri = 'rtsp://192.168.1.2:554/cam/realmonitor?channel=1&subtype=' + subtype;
    const client = net.createConnection({ host: '192.168.1.2', port: 554 }, () => {
      client.write('DESCRIBE ' + uri + ' RTSP/1.0\r\nCSeq: 1\r\n\r\n');
    });

    client.on('data', (data) => {
      const str = data.toString();
      if (str.includes('401 Unauthorized')) {
        const realmMatch = str.match(/realm="([^"]+)"/);
        const nonceMatch = str.match(/nonce="([^"]+)"/);
        if (realmMatch && nonceMatch) {
          const realm = realmMatch[1];
          const nonce = nonceMatch[1];
          const ha1 = md5('admin:' + realm + ':kumar@1212');
          const ha2 = md5('DESCRIBE:' + uri);
          const resp = md5(ha1 + ':' + nonce + ':' + ha2);
          client.write('DESCRIBE ' + uri + ' RTSP/1.0\r\nCSeq: 2\r\nAuthorization: Digest username="admin", realm="' + realm + '", nonce="' + nonce + '", uri="' + uri + '", response="' + resp + '"\r\n\r\n');
        }
      } else if (str.includes('200 OK')) {
        console.log('=== SUBTYPE ' + subtype + ' ===');
        const sdp = str.substring(str.indexOf('v=0'));
        console.log(sdp);
        client.end();
        resolve();
      }
    });
    setTimeout(() => { client.destroy(); resolve(); }, 3000);
  });
}

(async () => {
  await probe(0);
  await probe(1);
  process.exit(0);
})();
