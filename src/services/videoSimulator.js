// Realistic CCTV & AI Vision Canvas Simulator Engine

export class CameraStreamSimulator {
  constructor(canvas, camera, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = camera;
    this.options = options;
    this.animId = null;
    this.startTime = Date.now();
    this.objects = this.initSceneObjects();
    this.alarmActive = false;
    this.tripwires = options.tripwires || [];
    this.onTripwireCross = options.onTripwireCross || null;
    this.lastTriggerTime = 0;

    // Viewport transform for PTZ
    this.pan = camera.pan || 0;
    this.tilt = camera.tilt || 0;
    this.zoom = camera.zoom || 1.0;
  }

  updateCamera(camera) {
    this.camera = camera;
    this.updatePTZ(camera.pan || 0, camera.tilt || 0, camera.zoom || 1.0);
  }

  updatePTZ(pan, tilt, zoom) {
    this.pan = Math.max(-100, Math.min(100, pan));
    this.tilt = Math.max(-60, Math.min(60, tilt));
    this.zoom = Math.max(1.0, Math.min(4.0, zoom));
  }

  setTripwires(tripwires) {
    this.tripwires = tripwires.filter(tw => tw.cameraId === this.camera.id);
  }

  initSceneObjects() {
    const list = [];
    
    // Scene-specific animated actors
    if (this.camera.sceneType === 'gate' || this.camera.sceneType === 'parking') {
      list.push({
        type: 'vehicle',
        label: 'TRUCK',
        x: 50,
        y: 180,
        width: 140,
        height: 70,
        vx: 1.2,
        vy: 0,
        confidence: 0.94,
        color: '#38bdf8',
      });
      list.push({
        type: 'person',
        label: 'GUARD',
        x: 280,
        y: 140,
        width: 32,
        height: 75,
        vx: -0.4,
        vy: 0.1,
        confidence: 0.96,
        color: '#4ade80',
      });
    } else if (this.camera.sceneType === 'perimeter') {
      list.push({
        type: 'person',
        label: 'INTRUDER',
        x: 40,
        y: 150,
        width: 34,
        height: 80,
        vx: 0.7,
        vy: 0.2,
        confidence: 0.89,
        color: '#f87171',
      });
    } else if (this.camera.sceneType === 'warehouse' || this.camera.sceneType === 'assembly') {
      list.push({
        type: 'vehicle',
        label: 'FORKLIFT',
        x: 120,
        y: 190,
        width: 100,
        height: 65,
        vx: 0.8,
        vy: 0,
        confidence: 0.91,
        color: '#fbbf24',
      });
      list.push({
        type: 'person',
        label: 'WORKER',
        x: 320,
        y: 160,
        width: 30,
        height: 70,
        vx: -0.5,
        vy: 0,
        confidence: 0.97,
        color: '#4ade80',
      });
    } else {
      // Office / Server Vault
      list.push({
        type: 'person',
        label: 'STAFF',
        x: 180,
        y: 130,
        width: 32,
        height: 75,
        vx: 0.6,
        vy: 0.1,
        confidence: 0.95,
        color: '#4ade80',
      });
    }
    return list;
  }

  start() {
    if (this.animId) return;
    const render = () => {
      this.drawFrame();
      this.animId = requestAnimationFrame(render);
    };
    this.animId = requestAnimationFrame(render);
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  drawFrame() {
    const { canvas, ctx } = this;
    if (!canvas || !ctx) return;

    const w = canvas.width || 640;
    const h = canvas.height || 360;

    // Check if camera is offline / cable cut
    if (this.camera.status === 'offline') {
      ctx.fillStyle = '#06080e';
      ctx.fillRect(0, 0, w, h);

      // Render static noise effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let y = 0; y < h; y += 3) {
        if (Math.random() > 0.4) {
          ctx.fillRect(0, y, w, 2);
        }
      }

      // Offline warning banner
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ VIDEO LOSS / NO SIGNAL DETECTED', w / 2, h / 2 - 12);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('CHECK RTSP CARRIER / ETHERNET CABLE CONNECTION', w / 2, h / 2 + 12);
      return;
    }

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Apply PTZ transformation
    ctx.translate(w / 2, h / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-w / 2 - this.pan, -h / 2 - this.tilt);

    // 1. Draw Architectural / Environmental Scene
    this.drawBackgroundScene(w, h);

    // 2. Draw Simulated Scene Actors & Motion
    this.updateAndDrawObjects(w, h);

    // 3. Draw Tripwires / Virtual Detection Lines
    this.drawTripwires(w, h);

    ctx.restore();

    // 4. Subtle CCTV Sensor Noise & Vignette
    this.drawSensorGrain(w, h);
  }

  drawBackgroundScene(w, h) {
    const { ctx } = this;
    const type = this.camera.sceneType;

    // Floor and Wall perspective
    if (type === 'perimeter') {
      // Dark night sky + Thermal green/blue ground
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
      skyGrad.addColorStop(0, '#09131f');
      skyGrad.addColorStop(1, '#0e2338');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.6);

      // Ground
      ctx.fillStyle = '#0a1d18';
      ctx.fillRect(0, h * 0.6, w, h * 0.4);

      // Fence wire mesh
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, h * 0.35);
        ctx.lineTo(x, h * 0.75);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, h * 0.35);
      ctx.lineTo(w, h * 0.35);
      ctx.moveTo(0, h * 0.75);
      ctx.lineTo(w, h * 0.75);
      ctx.stroke();

    } else if (type === 'warehouse' || type === 'assembly') {
      // Industrial Warehouse racks & high ceiling
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);

      // Concrete Floor with perspective lines
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      ctx.lineTo(w, h * 0.5);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Warehouse Racks
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      for (let x = 60; x < w; x += 140) {
        ctx.strokeRect(x, h * 0.15, 80, h * 0.45);
        ctx.fillStyle = '#3b82f633';
        ctx.fillRect(x + 5, h * 0.2, 70, 25);
        ctx.fillStyle = '#f59e0b33';
        ctx.fillRect(x + 5, h * 0.35, 70, 25);
      }

    } else if (type === 'server') {
      // High-tech Data Center Server Racks with blinking LEDs
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, w, h);

      // Server Racks Left & Right
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 40, 140, h - 80);
      ctx.fillRect(w - 140, 40, 140, h - 80);

      // Blinking server LEDs
      const time = Date.now() / 300;
      for (let i = 0; i < 12; i++) {
        const blink1 = Math.sin(time + i) > 0;
        const blink2 = Math.cos(time + i * 2) > 0;
        ctx.fillStyle = blink1 ? '#38bdf8' : '#0369a1';
        ctx.fillRect(20, 60 + i * 18, 6, 4);
        ctx.fillStyle = blink2 ? '#4ade80' : '#15803d';
        ctx.fillRect(w - 30, 60 + i * 18, 6, 4);
      }

    } else {
      // General Gate / Office / Parking Outdoor scene
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h * 0.45);

      // Road / Floor
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      // Road lane markings
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([20, 15]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.45);
      ctx.lineTo(w * 0.5, h);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  updateAndDrawObjects(w, h) {
    const { ctx } = this;

    this.objects.forEach(obj => {
      // Movement logic
      obj.x += obj.vx;
      obj.y += obj.vy;

      // Wrap around bounds
      if (obj.x > w + 40) obj.x = -60;
      if (obj.x < -70) obj.x = w + 30;

      // Draw silhouette object
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      if (obj.type === 'vehicle') {
        // Vehicle Body
        ctx.fillStyle = '#334155';
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        // Cabin
        ctx.fillStyle = '#64748b';
        ctx.fillRect(obj.x + obj.width * 0.5, obj.y - 20, obj.width * 0.4, 25);
        // Wheels
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(obj.x + 25, obj.y + obj.height, 12, 0, Math.PI * 2);
        ctx.arc(obj.x + obj.width - 25, obj.y + obj.height, 12, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Person figure
        ctx.fillStyle = '#94a3b8';
        // Head
        ctx.beginPath();
        ctx.arc(obj.x + obj.width / 2, obj.y - 10, 9, 0, Math.PI * 2);
        ctx.fill();
        // Body & Legs
        ctx.fillRect(obj.x + 4, obj.y, obj.width - 8, obj.height);
      }

      // Check Tripwire Intersection
      this.checkTripwireHit(obj, w, h);

      // AI Bounding Box (YOLO Vision Style)
      if (this.camera.hasAiAnalytics) {
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = obj.color;
        ctx.strokeRect(obj.x - 4, obj.y - 22, obj.width + 8, obj.height + 26);

        // Label Badge
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x - 4, obj.y - 36, obj.width + 8, 14);

        ctx.fillStyle = '#0a0d14';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        const confPercent = Math.round(obj.confidence * 100);
        ctx.fillText(`${obj.label} ${confPercent}%`, obj.x - 1, obj.y - 26);
      }
    });
  }

  checkTripwireHit(obj, w, h) {
    const now = Date.now();
    if (now - this.lastTriggerTime < 4000) return; // Debounce 4s

    this.tripwires.forEach(tw => {
      if (!tw.enabled) return;
      if (tw.targetClasses && !tw.targetClasses.includes(obj.type)) return;

      const p1 = { x: tw.points[0].x * w, y: tw.points[0].y * h };
      const p2 = { x: tw.points[1].x * w, y: tw.points[1].y * h };

      const objCenter = { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 };

      // Distance from point to line segment
      const dist = this.distToSegment(objCenter, p1, p2);
      if (dist < 18) {
        this.lastTriggerTime = now;
        tw.active = true;
        setTimeout(() => { tw.active = false; }, 1500);

        if (this.onTripwireCross) {
          this.onTripwireCross({
            cameraId: this.camera.id,
            cameraName: this.camera.name,
            tripwireName: tw.name,
            target: `${obj.label} (${obj.type})`,
            confidence: `${Math.round(obj.confidence * 100)}%`,
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      }
    });
  }

  distToSegment(p, v, w) {
    const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  drawTripwires(w, h) {
    const { ctx } = this;
    this.tripwires.forEach(tw => {
      if (!tw.enabled || tw.points.length < 2) return;

      const p1 = { x: tw.points[0].x * w, y: tw.points[0].y * h };
      const p2 = { x: tw.points[1].x * w, y: tw.points[1].y * h };

      ctx.save();
      ctx.lineWidth = tw.active ? 4 : 2;
      ctx.strokeStyle = tw.active ? '#ef4444' : (tw.color || '#f59e0b');
      ctx.setLineDash([8, 6]);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Tripwire Direction Arrow & Badge
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      ctx.setLineDash([]);
      ctx.fillStyle = tw.active ? '#ef4444' : '#1e293b';
      ctx.strokeStyle = tw.color || '#f59e0b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(midX, midY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', midX, midY + 3);

      ctx.restore();
    });
  }

  drawSensorGrain(w, h) {
    const { ctx } = this;
    // Scanline effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
  }

  captureSnapshot() {
    return this.canvas.toDataURL('image/jpeg', 0.95);
  }
}
