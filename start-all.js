import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function start() {
  const mtxRunning = await isPortOpen(8888);
  let mtxProcess = null;

  if (!mtxRunning) {
    console.log('[AegisVMS] Starting MediaMTX RTSP-to-Web streaming gateway...');
    const mtxPath = path.join(__dirname, 'mediamtx', 'mediamtx.exe');
    mtxProcess = spawn(mtxPath, [], {
      cwd: path.join(__dirname, 'mediamtx'),
      stdio: 'ignore',
      detached: false
    });

    mtxProcess.on('error', (err) => {
      console.warn('[AegisVMS] Note: Could not auto-launch mediamtx.exe:', err.message);
    });
  } else {
    console.log('[AegisVMS] MediaMTX is already active on port 8888.');
  }

  // Start Vite dev server
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const viteProcess = spawn(npxCmd, ['vite', ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: __dirname,
    shell: true
  });

  const cleanup = () => {
    if (mtxProcess && !mtxProcess.killed) {
      mtxProcess.kill();
    }
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}

start();
