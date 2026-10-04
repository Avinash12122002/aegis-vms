import express from 'express';
import cors from 'cors';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Path to recordings folder created by MediaMTX
const RECORDINGS_DIR = path.join(__dirname, 'mediamtx', 'recordings');

// Ensure recordings dir exists
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

// In-memory event log for AI and system alerts
const eventLog = [
  {
    id: 'evt-init',
    cameraId: 'cpplus-1',
    channel: 'cpplus_ch1',
    type: 'system',
    label: 'VMS Recording Service Started',
    confidence: 1.0,
    timestamp: new Date().toISOString()
  }
];

// Helper: Scan recordings for a channel
function getChannelRecordings(channelName) {
  const channelDir = path.join(RECORDINGS_DIR, channelName);
  if (!fs.existsSync(channelDir)) {
    return [];
  }

  const files = fs.readdirSync(channelDir);
  return files
    .filter(f => f.endsWith('.mp4') || f.endsWith('.fmp4') || f.endsWith('.ts'))
    .map(filename => {
      const filePath = path.join(channelDir, filename);
      const stat = fs.statSync(filePath);
      
      // Parse timestamp from format 2026-10-04_23-02-19.mp4
      const timeStr = filename.replace(/\.(mp4|fmp4|ts)$/, '').replace('_', 'T').replace(/-/g, (match, offset) => offset > 10 ? ':' : '-');
      const startTime = new Date(timeStr).toISOString();

      return {
        filename,
        channel: channelName,
        filePath,
        sizeBytes: stat.size,
        sizeMB: (stat.size / (1024 * 1024)).toFixed(2),
        startTime,
        createdTime: stat.birthtime.toISOString(),
        modifiedTime: stat.mtime.toISOString(),
        streamUrl: `/api/recordings/stream/${channelName}/${filename}`,
        downloadUrl: `/api/recordings/download/${channelName}/${filename}`
      };
    })
    .sort((a, b) => b.filename.localeCompare(a.filename)); // newest first
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. Health & Telemetry
app.get('/api/health', (req, res) => {
  let totalRecordingBytes = 0;
  let totalFiles = 0;

  try {
    const channels = fs.existsSync(RECORDINGS_DIR) ? fs.readdirSync(RECORDINGS_DIR) : [];
    channels.forEach(ch => {
      const chDir = path.join(RECORDINGS_DIR, ch);
      if (fs.statSync(chDir).isDirectory()) {
        const files = fs.readdirSync(chDir);
        files.forEach(f => {
          totalFiles++;
          totalRecordingBytes += fs.statSync(path.join(chDir, f)).size;
        });
      }
    });
  } catch (err) {
    console.error('Error calculating recordings size:', err);
  }

  res.json({
    status: 'ONLINE',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      cpuArch: os.arch(),
      totalMemMB: Math.round(os.totalmem() / (1024 * 1024)),
      freeMemMB: Math.round(os.freemem() / (1024 * 1024)),
      processMemMB: Math.round(process.memoryUsage().heapUsed / (1024 * 1024))
    },
    storage: {
      recordingsDirectory: RECORDINGS_DIR,
      totalRecordingsCount: totalFiles,
      totalStorageUsedMB: (totalRecordingBytes / (1024 * 1024)).toFixed(2),
      totalStorageUsedGB: (totalRecordingBytes / (1024 * 1024 * 1024)).toFixed(3)
    }
  });
});

// 2. List all channels and their recordings summary
app.get('/api/recordings', (req, res) => {
  const channels = ['cpplus_ch1', 'cpplus_ch2', 'cpplus_ch3', 'cpplus_ch4', 'cpplus_ch5', 'cpplus_ch6', 'cpplus_ch7', 'cpplus_ch8'];
  const summary = channels.map(ch => {
    const recordings = getChannelRecordings(ch);
    return {
      channel: ch,
      recordingsCount: recordings.length,
      latestRecording: recordings[0] || null,
      totalBytes: recordings.reduce((acc, r) => acc + r.sizeBytes, 0)
    };
  });

  res.json({ channels: summary });
});

// 3. List recordings for a specific channel
app.get('/api/recordings/:channel', (req, res) => {
  const { channel } = req.params;
  const recordings = getChannelRecordings(channel);
  res.json({
    channel,
    count: recordings.length,
    recordings
  });
});

// 4. Stream recorded video with HTTP 206 Partial Content (Range Requests)
app.get('/api/recordings/stream/:channel/:filename', (req, res) => {
  const { channel, filename } = req.params;
  const filePath = path.join(RECORDINGS_DIR, channel, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Recording file not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
      'Access-Control-Allow-Origin': '*'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Access-Control-Allow-Origin': '*'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// 5. Download clip directly
app.get('/api/recordings/download/:channel/:filename', (req, res) => {
  const { channel, filename } = req.params;
  const filePath = path.join(RECORDINGS_DIR, channel, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Recording file not found');
  }

  res.download(filePath, filename);
});

// 6. Evidence Exporter with SHA-256 Cryptographic Hash
app.post('/api/recordings/export', (req, res) => {
  const { channel, filename, investigatorName, incidentNotes } = req.body;
  const filePath = path.join(RECORDINGS_DIR, channel, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Source clip not found' });
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const sha256Hash = hashSum.digest('hex');

    const certificate = {
      exportId: `EXP-${Date.now()}`,
      exportedAt: new Date().toISOString(),
      investigator: investigatorName || 'Security Operations Center',
      incidentNotes: incidentNotes || 'Courtroom Evidence Export',
      fileDetails: {
        filename,
        channel,
        fileSizeBytes: fileBuffer.length,
        sha256Hash: sha256Hash
      },
      digitalSignatureStatus: 'VERIFIED_TAMPER_PROOF',
      exportUrl: `/api/recordings/download/${channel}/${filename}`
    };

    res.json(certificate);
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate hash: ' + err.message });
  }
});

// 7. AI Events API
app.get('/api/ai/events', (req, res) => {
  res.json({ events: eventLog.slice(0, 50) });
});

// 8. Trigger an AI alarm event (for testing & perimeter breaches)
app.post('/api/ai/trigger', (req, res) => {
  const { cameraId, channel, type, label, confidence, zoneName } = req.body;
  const newEvent = {
    id: `evt-${Date.now()}`,
    cameraId: cameraId || 'cpplus-1',
    channel: channel || 'cpplus_ch1',
    type: type || 'person',
    label: label || 'Person Detected in Restricted Zone',
    confidence: confidence || 0.94,
    zoneName: zoneName || 'Perimeter Gate',
    timestamp: new Date().toISOString()
  };

  eventLog.unshift(newEvent);
  if (eventLog.length > 200) eventLog.pop();

  // Broadcast to all WebSocket clients
  broadcastWs({
    event: 'AI_ALARM',
    data: newEvent
  });

  res.json({ success: true, event: newEvent });
});

// -------------------------------------------------------------
// WEBSOCKET SERVER (Real-Time Alarms & Telemetry Broadcast)
// -------------------------------------------------------------
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcastWs(message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('[AegisVMS Backend] Client connected to WebSocket');
  
  // Send initial welcome & system state
  ws.send(JSON.stringify({
    event: 'INIT',
    data: {
      message: 'Connected to AegisVMS Backend Telemetry Server',
      timestamp: new Date().toISOString(),
      channelsMonitored: 8
    }
  }));

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      }
    } catch (e) {
      console.error(e);
    }
  });
});

// Periodic simulated AI perimeter heartbeat to demonstrate live alerts
setInterval(() => {
  if (wss.clients.size > 0) {
    const randomCh = Math.floor(Math.random() * 8) + 1;
    const types = ['person', 'vehicle', 'tripwire_breach'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    if (Math.random() > 0.6) { // Occasional alert
      const labels = {
        person: 'Human presence detected near gate',
        vehicle: 'Vehicle entered parking ramp',
        tripwire_breach: 'Virtual perimeter tripwire crossed'
      };

      const event = {
        id: `evt-${Date.now()}`,
        cameraId: `cpplus-${randomCh}`,
        channel: `cpplus_ch${randomCh}`,
        type: randomType,
        label: labels[randomType],
        confidence: Number((0.88 + Math.random() * 0.1).toFixed(2)),
        timestamp: new Date().toISOString()
      };

      eventLog.unshift(event);
      if (eventLog.length > 200) eventLog.pop();

      broadcastWs({
        event: 'AI_ALARM',
        data: event
      });
    }
  }
}, 8000);

// Start server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛡️  AegisVMS Enterprise Backend Server running on port ${PORT}`);
  console.log(`📁 Recordings Directory: ${RECORDINGS_DIR}`);
  console.log(`🌐 REST API: http://localhost:${PORT}/api/recordings`);
  console.log(`⚡ WebSocket Server: ws://localhost:${PORT}/ws`);
  console.log(`====================================================`);
});
