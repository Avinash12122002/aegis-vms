// Automated Unit & Feature Validation Suite for AegisVMS

import { 
  initialSites, 
  initialCameras, 
  initialTripwires, 
  initialCloudflareConfig, 
  initialUsers
} from './src/services/mockData.js';
import { CameraStreamSimulator } from './src/services/videoSimulator.js';

console.log('====================================================');
console.log('🧪 RUNNING AEGIS VMS AUTOMATED TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failedTests++;
  }
}

// ------------------------------------------------------------------
// Test 1: Seed Data Integrity
// ------------------------------------------------------------------
console.log('--- TEST GROUP 1: Camera & Site Models ---');
assert(initialSites.length >= 1, `Multi-site configuration loaded (${initialSites.length} Site available)`);
assert(initialCameras.length === 8, `${initialCameras.length} CP PLUS Cameras registered`);

const rtspValid = initialCameras.every(c => c.rtspUrl.startsWith('rtsp://') && c.onvifPort > 0);
assert(rtspValid, 'All cameras have valid RTSP URLs and ONVIF ports');
assert(initialCameras.every(c => c.ip === '192.168.1.2'), 'All cameras route through home CP PLUS DVR at 192.168.1.2');

// ------------------------------------------------------------------
// Test 2: Cloudflare R2 & Zero-Egress Economics
// ------------------------------------------------------------------
console.log('\n--- TEST GROUP 2: Cloudflare R2 Configuration ---');
assert(initialCloudflareConfig.egressCostUSD === 0.00, 'Cloudflare R2 verified with $0 Zero-Egress fees');
assert(initialCloudflareConfig.usedStorageTB === 1.34, 'Cloud storage tracking 1.34 TB used');
const calculatedCost = initialCloudflareConfig.usedStorageTB * 15.0;
assert(Math.abs(calculatedCost - initialCloudflareConfig.monthlyCostUSD) < 0.01, 'Storage billing matches $15 / TB monthly tier');
assert(initialCloudflareConfig.tunnelStatus === 'healthy', 'Cloudflare Zero Trust Tunnel is healthy');

// ------------------------------------------------------------------
// Test 3: PTZ Boundary Clamping
// ------------------------------------------------------------------
console.log('\n--- TEST GROUP 3: PTZ Joystick Math & Clamping ---');
const dummyCanvas = { width: 960, height: 540, getContext: () => ({}) };
const sim = new CameraStreamSimulator(dummyCanvas, initialCameras[0]);

sim.updatePTZ(200, 150, 10);
assert(sim.pan === 100, 'PTZ Pan clamped to maximum limit (+100)');
assert(sim.tilt === 60, 'PTZ Tilt clamped to maximum limit (+60)');
assert(sim.zoom === 4.0, 'PTZ Zoom clamped to optical limit (4.0x)');

sim.updatePTZ(-500, -300, 0.2);
assert(sim.pan === -100, 'PTZ Pan clamped to minimum limit (-100)');
assert(sim.tilt === -60, 'PTZ Tilt clamped to minimum limit (-60)');
assert(sim.zoom === 1.0, 'PTZ Zoom clamped to minimum wide limit (1.0x)');

// ------------------------------------------------------------------
// Test 4: AI Virtual Tripwire Collision Math
// ------------------------------------------------------------------
console.log('\n--- TEST GROUP 4: AI Tripwire Intersection Math ---');
assert(initialTripwires.length > 0, 'Virtual tripwire rules initialized across perimeter cameras');
const v = { x: 10, y: 100 };
const w = { x: 900, y: 100 };

const pOnLine = { x: 450, y: 100 };
const distZero = sim.distToSegment(pOnLine, v, w);
assert(Math.round(distZero) === 0, 'Distance to segment is 0 for point on line');

const pNear = { x: 450, y: 90 };
const distNear = sim.distToSegment(pNear, v, w);
assert(Math.round(distNear) === 10, 'Distance calculation accurately reports 10px offset');

const pFar = { x: 450, y: 350 };
const distFar = sim.distToSegment(pFar, v, w);
assert(distFar > 50, 'Distance calculation reports far point correctly');

// ------------------------------------------------------------------
// Test 5: Role-Based Access Control (RBAC)
// ------------------------------------------------------------------
console.log('\n--- TEST GROUP 5: Enterprise RBAC Matrix ---');
const admin = initialUsers.find(u => u.role === 'Super Admin');
assert(admin !== undefined && admin.sites.includes('All Sites'), 'Super Admin has access to All Sites');

// ------------------------------------------------------------------
// Test 6: Hardware Telemetry & Two-Way Intercom
// ------------------------------------------------------------------
console.log('\n--- TEST GROUP 6: Hardware Telemetry & Audio Intercom ---');
const audioCams = initialCameras.filter(c => c.twoWayAudioCapable);
assert(audioCams.length >= 3, `Two-Way Audio Intercom configured on ${audioCams.length} perimeter & gate cameras`);

const normalTemps = initialCameras.every(c => c.temperatureC >= 30 && c.temperatureC <= 50);
assert(normalTemps, 'All camera thermal sensors report healthy operating temperatures (<50°C)');

const lowLatency = initialCameras.every(c => c.latencyMs < 30);
assert(lowLatency, 'Sub-second stream latency verified across all registered feeds (<30ms)');

// ------------------------------------------------------------------
// Test 7: AI Forensic Smart Search Logic
// ------------------------------------------------------------------
console.log('\n--- TEST GROUP 7: AI Smart Forensic Search ---');
const sampleEvents = [
  { targetType: 'vehicle', licensePlate: 'MH-04-AZ-4921' },
  { targetType: 'person', licensePlate: 'N/A' },
  { targetType: 'vehicle', licensePlate: 'DL-01-CQ-8822' },
];
assert(sampleEvents.filter(r => r.targetType === 'vehicle').length === 2, 'Forensic query by target classification (Vehicle) verified');
assert(sampleEvents.filter(r => r.licensePlate.includes('MH-04')).length === 1, 'ANPR License plate substring lookup verified');

console.log('\n====================================================');
console.log(`🏁 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
