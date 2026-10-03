# 🛡️ AegisVMS — Enterprise Video Management & AI Surveillance System

An industry-ready, cloud-connected Video Management System (VMS) built with **React**, **HTML5 Canvas & WebRTC**, **Cloudflare R2**, and **AI Computer Vision Analytics**.

---

## 🌟 Key Features

### 1. 🎥 Live Video Wall & Control Room
* **Dynamic Grid Layouts:** 1x1 (Focus), 2x2 (Quad), 3x3 (9-cam), and 4x4 (16-cam) grids.
* **Dual-Streaming Optimization:** Automatically delivers lightweight Sub-stream (VGA) for multi-camera grids and high-bitrate Main-stream (4K / 1080p) when maximizing a camera.
* **On-Screen Display (OSD):** Real-time millisecond timecode, camera name, REC indicator, FPS, resolution, and bitrate telemetry.
* **PTZ Controller Suite:** 3x3 Pan/Tilt joystick, optical zoom controls (+/-), preset positions (Gate, Dock, Vault), and automated patrol tour loop.
* **Instant HD Snapshot:** Single-click canvas frame capture and download with shutter audio.

### 2. 🎙️ Two-Way Audio Intercom (Push-to-Talk)
* **Live Operator Broadcast:** Speak directly through camera loudspeakers at gates, warehouses, and vault doors.
* **Push-to-Talk Control:** Hold-to-transmit button with realistic radio beeps and VU audio waveform level visualization.

### 3. 🗺️ Facility E-Map (Architectural Floor Plan Surveillance)
* **Interactive Floor Plan:** View architectural blueprints of your facility (Lobby, Assembly Floor, Warehouse Bays, Vault).
* **Camera FOV Cones:** Displays camera locations with directional viewing cones showing where each camera is looking.
* **Flashing Alarm Beacons:** Camera icons on the floor plan flash red when an alarm is triggered.
* **Click-to-Preview:** Click any camera icon on the floor plan to view its live feed.

### 4. 📼 Recording & Synchronized Quad Playback
* **Interactive Smart Timeline:** Color-coded scrub bar (**Green** = Continuous 24/7 footage, **Red** = AI Intrusion alarms).
* **Multi-Speed VCR Controls:** 0.5x, 1x, 2x, 4x, 8x playback speed with jump forward/backward.
* **Synchronized Quad-Sync Mode:** Playback up to 4 cameras simultaneously at the exact same timestamp to track suspects moving across multiple angles.
* **Evidence Exporter:** Export incident video clips with **cryptographic SHA-256 verification hash** to ensure tamper-proof evidence for legal compliance.

### 5. 🔍 AI Forensic & Attribute Search
* **Deep Neural Attribute Filter:** Search video archives by target classification (**Person** vs **Vehicle**), **Clothing / Vehicle Color** (White, Black, Red, Blue, Yellow), and date range.
* **Automatic Number Plate Recognition (ANPR):** Search historical footage by license plate substrings with instant jump to playback.

### 6. 🧠 AI Video Analytics & Virtual Tripwires
* **Interactive Tripwire Editor:** Click directly on any live camera feed to place virtual boundary lines.
* **Directional Filtering:** Configurable detection direction (A to B, B to A, or Both).
* **Target Classification:** Distinguish between **Persons** and **Vehicles** to eliminate false alarms.
* **Real-Time Siren & Alarms:** Sound synthesizer triggers instant audio alarms and visual flashing banners upon perimeter breach.

### 7. 📊 Hardware & Network Telemetry Diagnostics
* **Live Telemetry:** Real-time stream latency (ms), packet loss (%), thermal sensor temperature (°C), and uptime tracking.
* **Fault Injection & Cable-Cut Testing:** Test what happens when physical ethernet cables are disconnected, triggering immediate critical alarms.

### 8. ☁️ Cloudflare R2 Storage ($0 Zero-Egress)
* **Zero Egress Billing:** Unlimited streaming playback without surprise cloud bandwidth bills.
* **Storage Quota Tracking:** Live usage gauge (e.g. 1.34 TB used of 5 TB quota).
* **Automated Retention Loop:** Configurable 15, 30, 60, or 90 days rolling auto-purge policy.
* **Cloudflare Zero-Trust Tunnel:** Secure NAT traversal from behind home or office routers with zero open ports.

### 9. 👥 Enterprise Security & RBAC
* **Role-Based Access Control:** Super Admin, Branch Manager, Security Guard, and Auditor roles.
* **Granular Permission Matrix:** Camera-level view, export, and PTZ priority controls.
* **Security Audit Trail:** Immutable logging of operator actions, timestamps, and IP addresses.

### 10. 📲 PWA (1-Click Mobile Installation)
* Includes Web App Manifest (`manifest.json`) for 1-click home screen installation on Android and iOS (like GCmob).

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js (v18 or higher)
* npm

### Installation
```bash
# Clone the repository
git clone https://github.com/Avinash12122002/aegis-vms.git

# Navigate to project directory
cd camera

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Automated Tests

Run the built-in test suite to verify camera models, PTZ boundary clamping, Cloudflare R2 economics, AI tripwire math, hardware telemetry, and forensic search:

```bash
node test_vms.js
```

---

## 🏗️ Architecture Blueprint
For deep technical documentation on camera protocols (RTSP, ONVIF Profile S/G/T), MediaMTX/go2rtc configuration, and production deployment, refer to:
* [ENTERPRISE_VMS_IMPLEMENTATION_PLAN.md](file:///c:/Users/HP/Desktop/camera/ENTERPRISE_VMS_IMPLEMENTATION_PLAN.md)
