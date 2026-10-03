# 🛡️ AegisVMS — Enterprise Video Management & AI Surveillance System

An industry-ready, cloud-connected Video Management System (VMS) built with **React**, **HTML5 Canvas & WebRTC**, **Cloudflare R2**, and **AI Computer Vision Analytics**.

---

## 🌟 Key Features

### 1. 🎥 Live Video Wall & Control Room
* **Dynamic Grid Layouts:** 1x1 (Focus), 2x2 (Quad), 3x3 (9-cam), and 4x4 (16-cam) grids.
* **Dual-Streaming Optimization:** Automatically delivers lightweight Sub-stream (VGA) for multi-camera grids and high-bitrate Main-stream (4K / 1080p) when maximizing a camera.
* **On-Screen Display (OSD):** Real-time millisecond timecode, camera name, REC indicator, FPS, resolution, and bitrate telemetry.
* **PTZ Controller Suite:** 3x3 Pan/Tilt joystick, optical zoom controls (+/-), preset positions (Gate, Dock, Vault), and automated patrol tour loop.
* **Instant HD Snapshot:** Single-click canvas frame capture and download.

### 2. 📼 Recording & 24-Hour Timeline Playback
* **Interactive Smart Timeline:** Color-coded scrub bar (**Green** = Continuous 24/7 footage, **Red** = AI Intrusion alarms).
* **Multi-Speed VCR Controls:** 0.5x, 1x, 2x, 4x, 8x playback speed with jump forward/backward.
* **Date Picker:** Jump to historical recordings across any date.
* **Evidence Exporter:** Export incident video clips with **cryptographic SHA-256 verification hash** to ensure tamper-proof evidence for legal compliance.

### 3. 🧠 AI Video Analytics & Virtual Tripwires
* **Interactive Tripwire Editor:** Click directly on any live camera feed to place virtual boundary lines.
* **Directional Filtering:** Configurable detection direction (A to B, B to A, or Both).
* **Target Classification:** Distinguish between **Persons** and **Vehicles** to eliminate false alarms.
* **Real-Time Siren & Alarms:** Sound synthesizer triggers instant audio alarms and visual flashing banners upon perimeter breach.

### 4. ☁️ Cloudflare R2 Storage ($0 Zero-Egress)
* **Zero Egress Billing:** Unlimited streaming playback without surprise cloud bandwidth bills.
* **Storage Quota Tracking:** Live usage gauge (e.g. 1.34 TB used of 5 TB quota).
* **Automated Retention Loop:** Configurable 15, 30, 60, or 90 days rolling auto-purge policy.
* **Cloudflare Zero-Trust Tunnel:** Secure NAT traversal from behind home or office routers with zero open ports.

### 5. 👥 Enterprise Security & RBAC
* **Role-Based Access Control:** Super Admin, Branch Manager, Security Guard, and Auditor roles.
* **Granular Permission Matrix:** Camera-level view, export, and PTZ priority controls.
* **Security Audit Trail:** Immutable logging of operator actions, timestamps, and IP addresses.

### 6. 📱 Responsive & Mobile-Ready
* Designed for large control-room monitors, laptops, tablets, and smartphones (includes GCmob-style bottom navigation bar).

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js (v18 or higher)
* npm

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/<your-repo-name>.git

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

Run the built-in test suite to verify camera models, PTZ boundary clamping, Cloudflare R2 economics, and AI tripwire math:

```bash
node test_vms.js
```

---

## 🏗️ Architecture Blueprint
For deep technical documentation on camera protocols (RTSP, ONVIF Profile S/G/T), MediaMTX/go2rtc configuration, and production deployment, refer to:
* [ENTERPRISE_VMS_IMPLEMENTATION_PLAN.md](file:///c:/Users/HP/Desktop/camera/ENTERPRISE_VMS_IMPLEMENTATION_PLAN.md)
