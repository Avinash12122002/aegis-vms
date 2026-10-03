import net from 'net';
import crypto from 'crypto';

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

const uri = 'rtsp://192.168.1.2:554/cam/realmonitor?channel=1&subtype=0';
const client = net.createConnection({ host: '192.168.1.2', port: 554 }, () => {
  client.write(`DESCRIBE ${uri} RTSP/1.0\r\nCSeq: 1\r\n\r\n`);
});

client.on('data', (data) => {
  const str = data.toString();
  console.log('--- RECV ---\n' + str.trim());
  if (str.includes('401 Unauthorized')) {
    const realmMatch = str.match(/realm="([^"]+)"/);
    const nonceMatch = str.match(/nonce="([^"]+)"/);
    if (realmMatch && nonceMatch) {
      const realm = realmMatch[1];
      const nonce = nonceMatch[1];
      const user = 'admin';
      const pass = 'kumar@1212';
      const ha1 = md5(`${user}:${realm}:${pass}`);
      const ha2 = md5(`DESCRIBE:${uri}`);
      const response = md5(`${ha1}:${nonce}:${ha2}`);

      const authHeader = `Authorization: Digest username="${user}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}"\r\n`;
      const req = `DESCRIBE ${uri} RTSP/1.0\r\nCSeq: 2\r\n${authHeader}\r\n`;
      client.write(req);
    }
  } else if (str.includes('200 OK')) {
    console.log('\n=============================================');
    console.log('🎉 SUCCESS! CP PLUS DVR ACCEPTED CREDENTIALS!');
    console.log('=============================================');
    client.end();
  }
});

setTimeout(() => {
  client.destroy();
  process.exit(0);
}, 4000);
