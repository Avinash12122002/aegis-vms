import net from 'net';
import crypto from 'crypto';

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

async function checkChannel(ch) {
  return new Promise((resolve) => {
    const uri = `rtsp://192.168.1.2:554/cam/realmonitor?channel=${ch}&subtype=0`;
    const client = net.createConnection({ host: '192.168.1.2', port: 554 }, () => {
      client.write(`DESCRIBE ${uri} RTSP/1.0\r\nCSeq: 1\r\n\r\n`);
    });

    client.on('data', (data) => {
      const str = data.toString();
      if (str.includes('401 Unauthorized')) {
        const realmMatch = str.match(/realm="([^"]+)"/);
        const nonceMatch = str.match(/nonce="([^"]+)"/);
        if (realmMatch && nonceMatch) {
          const realm = realmMatch[1];
          const nonce = nonceMatch[1];
          const ha1 = md5(`admin:${realm}:kumar@1212`);
          const ha2 = md5(`DESCRIBE:${uri}`);
          const response = md5(`${ha1}:${nonce}:${ha2}`);
          client.write(`DESCRIBE ${uri} RTSP/1.0\r\nCSeq: 2\r\nAuthorization: Digest username="admin", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}"\r\n\r\n`);
        }
      } else if (str.includes('200 OK')) {
        console.log(`✅ CHANNEL ${ch}: LIVE & ACTIVE`);
        client.end();
        resolve(true);
      } else if (str.includes('404') || str.includes('500') || str.includes('400')) {
        client.end();
        resolve(false);
      }
    });

    client.on('error', () => resolve(false));
    setTimeout(() => {
      client.destroy();
      resolve(false);
    }, 1500);
  });
}

(async () => {
  console.log('--- Probing CP PLUS DVR Channels (1 - 8) ---');
  for (let ch = 1; ch <= 8; ch++) {
    await checkChannel(ch);
  }
  console.log('--- Scan Complete ---');
  process.exit(0);
})();
