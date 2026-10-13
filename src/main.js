import * as THREE from 'three';

/* ==========================================================
   1. CUSTOM FOLLOWER CURSOR
   ========================================================== */
function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let posX = mouseX;
  let posY = mouseY;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      cursor.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    isVisible = false;
  });

  const interactiveElements = 'a, button, input[type="range"], .tilt, .demo-button, .featured-card, .mini-card, .terminal-run-btn';
  document.querySelectorAll(interactiveElements).forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.setAttribute('data-hover', 'true'));
    el.addEventListener('mouseleave', () => cursor.removeAttribute('data-hover'));
  });

  // Re-bind hover for dynamically rendered elements
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, .tilt, .ledger-actions button')) {
      cursor.setAttribute('data-hover', 'true');
    } else {
      cursor.removeAttribute('data-hover');
    }
  });

  function renderCursor() {
    posX += (mouseX - posX) * 0.22;
    posY += (mouseY - posY) * 0.22;
    cursor.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();
}

/* ==========================================================
   2. TOAST NOTIFICATION & CLIPBOARD
   ========================================================== */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function initClipboardActions() {
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'deepanshukuntal787@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        showToast(`Email copied: ${email}`);
      } catch {
        showToast(email);
      }
    });
  }

  const copyPhoneBtn = document.getElementById('copy-phone-btn');
  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', async () => {
      const phone = copyPhoneBtn.getAttribute('data-phone') || '+917483742295';
      try {
        await navigator.clipboard.writeText(phone);
        showToast(`Phone copied: +91 74837 42295`);
      } catch {
        showToast(phone);
      }
    });
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const siteNav = document.getElementById('site-nav');
  if (mobileMenuBtn && siteNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('is-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ==========================================================
   3. HERO SCROLL CINEMA (Three.js 3D Particle Showcase)
   ========================================================== */
function initHeroCinema() {
  const cinema = document.querySelector('.cinema:not(.rail-fly)');
  const canvas = document.getElementById('hero-particles-canvas');
  if (!cinema || !canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070a, 0.0018);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 110);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle System Data
  const particleCount = 2800;
  const positions = new Float32Array(particleCount * 3);
  const targetPositions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  // Generate target shapes for different scroll phases:
  // Phase 0: "DEEPANSHU KUNTAL" text / orbit sphere
  // Phase 1: Ingress funnel (connections arriving)
  // Phase 2: 8 Parallel pod worker lanes
  // Phase 3: LangGraph agent routing arcs
  // Phase 4: Converged resilient beam

  const p0 = new Float32Array(particleCount * 3); // Text + Orbit Ring
  const p1 = new Float32Array(particleCount * 3); // Ingress funnel
  const p2 = new Float32Array(particleCount * 3); // 8 Worker lanes
  const p3 = new Float32Array(particleCount * 3); // LangGraph mesh
  const p4 = new Float32Array(particleCount * 3); // Converged output

  // Render text "DEEPANSHU KUNTAL" to a 2D offscreen canvas to sample particle targets
  const offCanvas = document.createElement('canvas');
  offCanvas.width = 1200;
  offCanvas.height = 300;
  const ctx = offCanvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1200, 300);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 96px "Unbounded", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DEEPANSHU KUNTAL', 600, 150);

  const imgData = ctx.getImageData(0, 0, 1200, 300);
  const textCoords = [];
  const step = 4;
  for (let y = 0; y < 300; y += step) {
    for (let x = 0; x < 1200; x += step) {
      const idx = (y * 1200 + x) * 4;
      if (imgData.data[idx] > 128) {
        textCoords.push({
          x: (x - 600) * 0.16,
          y: -(y - 150) * 0.16,
          z: (Math.random() - 0.5) * 8
        });
      }
    }
  }

  // Populate coordinates for all phases
  for (let i = 0; i < particleCount; i++) {
    // Colors: mostly crisp silver/white, lime (#d9ff67), and cyan (#90b9ff)
    const isLime = Math.random() < 0.28;
    const isBlue = Math.random() < 0.18;
    if (isLime) {
      colors[i * 3] = 0.85; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 0.4;
    } else if (isBlue) {
      colors[i * 3] = 0.56; colors[i * 3 + 1] = 0.73; colors[i * 3 + 2] = 1.0;
    } else {
      colors[i * 3] = 0.88; colors[i * 3 + 1] = 0.92; colors[i * 3 + 2] = 0.95;
    }
    sizes[i] = Math.random() * 2.2 + 0.8;

    // Phase 0: Text letters + orbiting satellite particles
    if (i < textCoords.length) {
      const coord = textCoords[i % textCoords.length];
      p0[i * 3] = coord.x;
      p0[i * 3 + 1] = coord.y + 7.5; // Lifted slightly for optimal vertical clearance
      p0[i * 3 + 2] = coord.z;
    } else {
      const theta = Math.random() * Math.PI * 2;
      const r = 50 + Math.random() * 25;
      p0[i * 3] = Math.cos(theta) * r;
      p0[i * 3 + 1] = Math.sin(theta) * (r * 0.35) + 7.5;
      p0[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }

    // Phase 1: Ingress cone funnel (arriving at ingress gateway ring)
    const t1 = Math.random();
    const angle1 = Math.random() * Math.PI * 2;
    const r1 = 3 + t1 * 40;
    p1[i * 3] = -70 + t1 * 60;
    p1[i * 3 + 1] = Math.sin(angle1) * r1;
    p1[i * 3 + 2] = Math.cos(angle1) * r1;

    // Phase 2: 8 Parallel pod worker lanes
    const lane = Math.floor(Math.random() * 8);
    const laneY = (lane - 3.5) * 6;
    const laneX = -50 + Math.random() * 80;
    p2[i * 3] = laneX;
    p2[i * 3 + 1] = laneY + (Math.random() - 0.5) * 1.5;
    p2[i * 3 + 2] = (Math.random() - 0.5) * 4;

    // Phase 3: LangGraph agent routing arcs
    const arcT = (Math.random() - 0.5) * 2;
    const arcX = arcT * 45;
    const arcY = Math.sin(arcT * Math.PI) * 18 + (Math.random() - 0.5) * 3;
    p3[i * 3] = arcX;
    p3[i * 3 + 1] = arcY;
    p3[i * 3 + 2] = Math.cos(arcT * Math.PI) * 12;

    // Phase 4: Converged output beam
    const t4 = Math.random();
    p4[i * 3] = -40 + t4 * 90;
    p4[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
    p4[i * 3 + 2] = (Math.random() - 0.5) * 3.5;

    // Initial position = Phase 0
    positions[i * 3] = p0[i * 3];
    positions[i * 3 + 1] = p0[i * 3 + 1];
    positions[i * 3 + 2] = p0[i * 3 + 2];
    targetPositions[i * 3] = p0[i * 3];
    targetPositions[i * 3 + 1] = p0[i * 3 + 1];
    targetPositions[i * 3 + 2] = p0[i * 3 + 2];
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Material
  const material = new THREE.PointsMaterial({
    size: 1.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Background Ring Gate & Wireframe Guides
  const ringGeo = new THREE.TorusGeometry(16, 0.2, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xd9ff67, transparent: true, opacity: 0.28 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.y = Math.PI / 2.4;
  ring.position.x = 2;
  scene.add(ring);

  // Scroll Progress Tracking
  const introEl = document.getElementById('cinema-intro');
  const stage1 = document.getElementById('stage-1');
  const stage2 = document.getElementById('stage-2');
  const stage3 = document.getElementById('stage-3');
  const stage4 = document.getElementById('stage-4');
  const cinemaRail = document.getElementById('cinema-rail');
  const railItems = document.querySelectorAll('.cinema-rail-item');
  const cinemaFinale = document.getElementById('cinema-finale');

  let mouseNormX = 0;
  let mouseNormY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseNormX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseNormY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Load slider interactive connection
  const loadSlider = document.getElementById('load-slider');
  const loadDisplay = document.getElementById('load-display');
  const statThroughput = document.getElementById('stat-throughput');
  const statProvision = document.getElementById('stat-provision');
  const statStatus = document.getElementById('stat-status');
  let clusterLoadFactor = 1.0;

  if (loadSlider) {
    loadSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      clusterLoadFactor = val / 520;
      loadDisplay.textContent = `${val} pods`;
      statThroughput.textContent = (val * 46 + Math.floor(Math.random() * 80)).toLocaleString();
      statProvision.textContent = `${(18 + val * 0.012).toFixed(1)} s`;

      if (val < 900) {
        statStatus.textContent = 'stable · 0 conflicts';
        statStatus.className = 'status-stable';
      } else if (val < 1600) {
        statStatus.textContent = 'autoscaling active';
        statStatus.className = 'status-warn';
      } else {
        statStatus.textContent = 'max capacity';
        statStatus.className = 'status-critical';
      }
    });
  }

  function updateScroll() {
    const rect = cinema.getBoundingClientRect();
    const totalDist = cinema.offsetHeight - window.innerHeight;
    const progress = Math.min(Math.max(-rect.top / totalDist, 0), 1);

    // Stage visibility helper
    function setOpacity(el, start, end, peak) {
      if (!el) return;
      let op = 0;
      if (progress >= start && progress <= end) {
        if (progress < peak) {
          op = (progress - start) / (peak - start);
        } else {
          op = 1 - (progress - peak) / (end - peak);
        }
      }
      el.style.opacity = Math.max(0, Math.min(1, op));
      el.style.transform = `translateY(${(1 - Math.max(0, Math.min(1, op))) * 20}px)`;
    }

    // Intro text
    if (introEl) {
      const introOp = Math.max(0, 1 - progress / 0.16);
      introEl.style.opacity = introOp;
      introEl.style.transform = `translateY(${(1 - introOp) * -25}px)`;
    }

    // Stages 1 to 4
    setOpacity(stage1, 0.16, 0.36, 0.26);
    setOpacity(stage2, 0.35, 0.55, 0.45);
    setOpacity(stage3, 0.54, 0.74, 0.64);
    setOpacity(stage4, 0.73, 0.90, 0.81);

    // Right Rail
    if (cinemaRail) {
      const railVisible = progress > 0.15 && progress < 0.90;
      cinemaRail.style.opacity = railVisible ? '1' : '0';
      const activeStage = progress < 0.35 ? 0 : progress < 0.54 ? 1 : progress < 0.73 ? 2 : 3;
      railItems.forEach((item, idx) => {
        item.setAttribute('data-active', idx === activeStage ? 'true' : 'false');
      });
    }

    // Finale
    if (cinemaFinale) {
      const finaleOp = Math.max(0, (progress - 0.88) / 0.1);
      cinemaFinale.style.opacity = finaleOp;
      cinemaFinale.style.transform = `translateY(${(1 - finaleOp) * 20}px)`;
      cinemaFinale.style.pointerEvents = progress > 0.88 ? 'auto' : 'none';
    }

    // Morph target positions based on progress
    // 0.0 - 0.2: p0 -> p1
    // 0.2 - 0.4: p1 -> p2
    // 0.4 - 0.65: p2 -> p3
    // 0.65 - 0.85: p3 -> p4
    // 0.85 - 1.0: p4 (interactive swarm)
    let srcArr, dstArr, blend;
    if (progress < 0.2) {
      srcArr = p0; dstArr = p1; blend = progress / 0.2;
    } else if (progress < 0.42) {
      srcArr = p1; dstArr = p2; blend = (progress - 0.2) / 0.22;
    } else if (progress < 0.68) {
      srcArr = p2; dstArr = p3; blend = (progress - 0.42) / 0.26;
    } else {
      srcArr = p3; dstArr = p4; blend = Math.min((progress - 0.68) / 0.24, 1);
    }

    for (let i = 0; i < particleCount * 3; i++) {
      targetPositions[i] = srcArr[i] + (dstArr[i] - srcArr[i]) * blend;
    }

    // Camera move based on progress
    camera.position.z = 110 - progress * 24;
    camera.position.x = Math.sin(progress * Math.PI) * 15;
    ring.rotation.z = progress * 4;
    ring.scale.setScalar(1 + progress * 0.4);
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // Animation Loop
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    const posAttr = geometry.attributes.position;
    const array = posAttr.array;

    // Lerp positions towards targets with gentle turbulence
    const speed = 0.08 * clusterLoadFactor;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      const noise = Math.sin(elapsedTime * 2 + i) * 0.4;
      array[idx] += (targetPositions[idx] + noise - array[idx]) * speed;
      array[idx + 1] += (targetPositions[idx + 1] + Math.cos(elapsedTime * 2 + i) * 0.4 - array[idx + 1]) * speed;
      array[idx + 2] += (targetPositions[idx + 2] - array[idx + 2]) * speed;
    }
    posAttr.needsUpdate = true;

    // Parallax mouse rotation
    scene.rotation.y = mouseNormX * 0.08;
    scene.rotation.x = -mouseNormY * 0.08;

    renderer.render(scene, camera);
  }
  animate();

  // Window resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ==========================================================
   4. COUNTER ANIMATION FOR PROOF STRIP
   ========================================================== */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        let start = 0;
        const duration = 1200;
        const startTime = performance.now();

        function updateNumber(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(start + (target - start) * easeOut);
          el.textContent = `${prefix}${current}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(updateNumber);
          } else {
            el.textContent = `${prefix}${target}${suffix}`;
          }
        }
        requestAnimationFrame(updateNumber);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach((c) => observer.observe(c));
}

/* ==========================================================
   5. INTERACTIVE TERMINAL BENCHMARK (CloudForge)
   ========================================================== */
function initTerminal() {
  const runBtn = document.getElementById('run-bench-btn');
  const screen = document.getElementById('terminal-screen');
  if (!runBtn || !screen) return;

  const logs = [
    { text: '$ ./cloudforge_bench --workspaces=500 --verify-isolation', cls: '' },
    { text: 'k8s cluster ............ connected (EKS us-east-1)', cls: 'terminal-dim' },
    { text: 'provisioning pods ...... 500 isolated pods created', cls: 'terminal-dim' },
    { text: 'ingress routing ........ wildcard *.cloudforge.dev ready', cls: 'terminal-dim' },
    { text: 'provision latency ...... 22.8 s (target <30s, achieved: PASS)', cls: 'terminal-accent' },
    { text: 'shared-state conflicts . 0 (isolated namespace boundaries)', cls: 'terminal-accent' },
    { text: 'workspace sync ......... persistent (GridFS cross-restart)', cls: 'terminal-dim' },
    { text: 'agent loop ............. LangGraph + Mistral active', cls: 'terminal-dim' },
    { text: 'status ................. 100% optimal & resilient', cls: 'terminal-accent' }
  ];

  runBtn.addEventListener('click', () => {
    runBtn.disabled = true;
    runBtn.textContent = 'Running...';
    screen.innerHTML = '<p class="terminal-dim">Initializing cluster regression suite...</p><p class="terminal-cursor">_</p>';

    let index = 0;
    const interval = setInterval(() => {
      if (index < logs.length) {
        const item = logs[index];
        const p = document.createElement('p');
        if (item.cls) p.className = item.cls;
        p.textContent = item.text;
        screen.insertBefore(p, screen.querySelector('.terminal-cursor'));
        index++;
      } else {
        clearInterval(interval);
        runBtn.disabled = false;
        runBtn.textContent = 'Run bench';
        showToast('CloudForge benchmark: 0 conflicts, 22.8s provisioning.');
      }
    }, 220);
  });
}

/* ==========================================================
   6. BACKEND DEEP-DIVE (SAGA & REDIS LOCK SIMULATOR)
   ========================================================== */
function initSagaLedger() {
  const bookBtn = document.getElementById('book-seat-btn');
  const failBtn = document.getElementById('simulate-fail-btn');
  const resetBtn = document.getElementById('reset-ledger-btn');
  const toggle = document.getElementById('idempotency-toggle');
  const seatDisplay = document.getElementById('seat-balance');
  const logContainer = document.getElementById('saga-log-container');
  const emptyMsg = document.getElementById('saga-empty-msg');
  const statusText = document.getElementById('saga-status-text');

  if (!bookBtn || !seatDisplay || !logContainer) return;

  let seats = 48;
  const maxSeats = 50;

  function addRow(status, title, codeSnippet) {
    if (emptyMsg) emptyMsg.style.display = 'none';
    const row = document.createElement('div');
    row.className = `ledger-row ${status === 'CONFIRMED' ? 'is-confirmed' : ''}`;
    row.innerHTML = `
      <b>${status}</b>
      <span>${title}</span>
      <code>${codeSnippet}</code>
    `;
    logContainer.prepend(row);
  }

  bookBtn.addEventListener('click', () => {
    if (seats <= 0) {
      statusText.setAttribute('data-tone', 'bad');
      statusText.textContent = 'Train sold out! No seats remaining in train #12952.';
      return;
    }

    const txId = 'tx_' + Math.random().toString(36).substring(2, 8);
    const seatNum = maxSeats - seats + 1;
    const lockOn = toggle ? toggle.checked : true;

    if (lockOn) {
      seats--;
      seatDisplay.textContent = `${seats} / ${maxSeats}`;
      seatDisplay.classList.remove('is-bad');
      addRow('CONFIRMED', `Seat #${seatNum} reserved`, `lock:seat_${seatNum} (TTL 30s)`);
      statusText.setAttribute('data-tone', 'ok');
      statusText.textContent = `[SAGA SUCCESS] Lock acquired -> Payment verified -> Kafka event synced to Elasticsearch (<45ms).`;
    } else {
      // Simulating race condition when locks disabled
      seats = Math.max(0, seats - 2);
      seatDisplay.textContent = `${seats} / ${maxSeats}`;
      seatDisplay.classList.add('is-bad');
      addRow('CONFLICT', `Double booking race!`, `lock:DISABLED (race hazard)`);
      statusText.setAttribute('data-tone', 'bad');
      statusText.textContent = `[RACE CONDITION] ⚠️ Without Redis distributed lock: Two concurrent holds claimed Seat #${seatNum}!`;
    }
  });

  failBtn.addEventListener('click', () => {
    const lockOn = toggle ? toggle.checked : true;
    const txId = 'tx_' + Math.random().toString(36).substring(2, 8);

    if (lockOn) {
      addRow('ROLLED_BACK', `Network drop on payment`, `compensate: 68ms SLA`);
      statusText.setAttribute('data-tone', 'warn');
      statusText.textContent = `[SAGA COMPENSATED] Payment network dropped! Distributed lock released & seat unreserved in 68ms (<100ms target). 0 phantom holds.`;
    } else {
      addRow('CORRUPT', `Dirty read deadlock`, `no-idempotency`);
      statusText.setAttribute('data-tone', 'bad');
      statusText.textContent = `[TRANSACTION LEAK] Phantom hold retained in database! Manual reconciliation required.`;
    }
  });

  resetBtn.addEventListener('click', () => {
    seats = 48;
    seatDisplay.textContent = `${seats} / ${maxSeats}`;
    seatDisplay.classList.remove('is-bad');
    logContainer.innerHTML = '<div class="ledger-empty">Saga orchestrator log is idle. Click \'Hold & Book Seat\' to trigger distributed transaction.</div>';
    statusText.setAttribute('data-tone', 'ok');
    statusText.textContent = 'Ready. Redis distributed lock active with optimistic concurrency check.';
  });
}

/* ==========================================================
   7. 3D TOPOLOGY MESH (Rail-Fly Cinema Showcase)
   ========================================================== */
function initTopologyCanvas() {
  const canvas = document.getElementById('topology-3d-canvas');
  const flySection = document.querySelector('.rail-fly');
  if (!canvas || !flySection) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 30, 80);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 3D Perspective Grid
  const gridHelper = new THREE.GridHelper(180, 36, 0xd9ff67, 0x1f2832);
  gridHelper.position.y = -10;
  scene.add(gridHelper);

  // Nodes & Connecting Lines
  const nodeCount = 20;
  const nodes = [];
  const nodeGeo = new THREE.SphereGeometry(1.2, 16, 16);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xd9ff67 });
  const alertMat = new THREE.MeshBasicMaterial({ color: 0xff966f });

  for (let i = 0; i < nodeCount; i++) {
    const mesh = new THREE.Mesh(nodeGeo, i % 5 === 0 ? alertMat : nodeMat);
    mesh.position.set(
      (Math.random() - 0.5) * 110,
      (Math.random() - 0.2) * 18,
      (Math.random() - 0.5) * 80
    );
    scene.add(mesh);
    nodes.push(mesh);
  }

  // Connecting network lines
  const lineMat = new THREE.LineBasicMaterial({ color: 0x90b9ff, transparent: true, opacity: 0.35 });
  for (let i = 0; i < nodeCount - 1; i++) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      nodes[i].position,
      nodes[(i + 1) % nodeCount].position
    ]);
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);
  }

  // Floating Data Packets
  const packetCount = 40;
  const packetGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const packetMat = new THREE.MeshBasicMaterial({ color: 0xd9ff67 });
  const packets = [];
  for (let i = 0; i < packetCount; i++) {
    const p = new THREE.Mesh(packetGeo, packetMat);
    p.position.copy(nodes[i % nodeCount].position);
    p.userData = {
      src: nodes[i % nodeCount].position,
      dst: nodes[(i + 3) % nodeCount].position,
      t: Math.random()
    };
    scene.add(p);
    packets.push(p);
  }

  // Tabs
  const tabCloudforge = document.getElementById('tab-cloudforge');
  const tabRailsync = document.getElementById('tab-railsync');
  const topoTitle = document.getElementById('topo-title');
  const topoDesc = document.getElementById('topo-desc');

  if (tabCloudforge && tabRailsync) {
    tabCloudforge.addEventListener('click', () => {
      tabCloudforge.classList.add('is-active');
      tabRailsync.classList.remove('is-active');
      topoTitle.textContent = 'Every container is an isolated pod.';
      topoDesc.textContent = 'Dynamic provisioning with NGINX wildcard ingress routing. Workspaces spin up on isolated compute with zero noisy neighbor interference.';
    });

    tabRailsync.addEventListener('click', () => {
      tabRailsync.classList.add('is-active');
      tabCloudforge.classList.remove('is-active');
      topoTitle.textContent = 'Sub-second event propagation.';
      topoDesc.textContent = 'Kafka domain events sync booking transactions to Elasticsearch indices in <200ms, decoupling reads from transactional stores.';
    });
  }

  // Topology slider
  const clusterSlider = document.getElementById('cluster-slider');
  const clusterTrafficVal = document.getElementById('cluster-traffic-val');
  const nodeActiveCount = document.getElementById('node-active-count');
  let flowRate = 0.5;

  if (clusterSlider) {
    clusterSlider.addEventListener('input', (e) => {
      flowRate = parseFloat(e.target.value);
      clusterTrafficVal.textContent = `${Math.round(flowRate * 200)}% nominal`;
      nodeActiveCount.textContent = Math.round(12 + flowRate * 18);
    });
  }

  // Scroll visibility
  const topoStage1 = document.getElementById('topo-stage-1');
  const topoStage2 = document.getElementById('topo-stage-2');
  const topoFinale = document.getElementById('topo-finale');

  function updateFlyScroll() {
    const rect = flySection.getBoundingClientRect();
    const totalDist = flySection.offsetHeight - window.innerHeight;
    const progress = Math.min(Math.max(-rect.top / totalDist, 0), 1);

    if (topoStage1) {
      const op1 = progress > 0.1 && progress < 0.45 ? 1 : 0;
      topoStage1.style.opacity = op1;
      topoStage1.style.transform = `translateY(${(1 - op1) * 20}px)`;
    }

    if (topoStage2) {
      const op2 = progress > 0.45 && progress < 0.8 ? 1 : 0;
      topoStage2.style.opacity = op2;
      topoStage2.style.transform = `translateY(${(1 - op2) * 20}px)`;
    }

    if (topoFinale) {
      const opFin = Math.max(0, (progress - 0.78) / 0.18);
      topoFinale.style.opacity = opFin;
      topoFinale.style.transform = `translateY(${(1 - opFin) * 20}px)`;
      topoFinale.style.pointerEvents = progress > 0.78 ? 'auto' : 'none';
    }

    // Camera flythrough along Z axis
    camera.position.z = 80 - progress * 60;
    camera.position.x = Math.sin(progress * Math.PI) * 20;
    gridHelper.position.z = (progress * 40) % 20;
  }

  window.addEventListener('scroll', updateFlyScroll, { passive: true });
  updateFlyScroll();

  // Render loop
  function animateTopology() {
    requestAnimationFrame(animateTopology);
    packets.forEach((p) => {
      p.userData.t += 0.008 * (flowRate + 0.2);
      if (p.userData.t > 1) p.userData.t = 0;
      p.position.lerpVectors(p.userData.src, p.userData.dst, p.userData.t);
    });

    renderer.render(scene, camera);
  }
  animateTopology();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ==========================================================
   8. ABOUT CODER PARTICLE CANVAS
   ========================================================== */
function initAboutCoderCanvas() {
  const canvas = document.getElementById('coder-particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.offsetWidth || 380);
  let height = (canvas.height = canvas.offsetHeight || 400);

  const particles = [];
  const count = 120;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -Math.random() * 1.2 - 0.2,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.7 + 0.3,
      char: ['0', '1', '<', '>', '{', '}', '/', '*', '+', 'k8s'][Math.floor(Math.random() * 10)]
    });
  }

  function renderCoder() {
    ctx.clearRect(0, 0, width, height);

    // Draw stylized desk & dual monitor silhouette in glowing neon strokes
    ctx.strokeStyle = '#d9ff6733';
    ctx.lineWidth = 1.5;

    // Left Monitor
    ctx.strokeRect(width * 0.15, height * 0.35, width * 0.32, height * 0.28);
    // Right Monitor
    ctx.strokeRect(width * 0.53, height * 0.35, width * 0.32, height * 0.28);

    // Monitor Stands
    ctx.beginPath();
    ctx.moveTo(width * 0.31, height * 0.63);
    ctx.lineTo(width * 0.31, height * 0.72);
    ctx.moveTo(width * 0.69, height * 0.63);
    ctx.lineTo(width * 0.69, height * 0.72);
    // Desk surface line
    ctx.moveTo(width * 0.08, height * 0.72);
    ctx.lineTo(width * 0.92, height * 0.72);
    // Keyboard
    ctx.strokeRect(width * 0.36, height * 0.75, width * 0.28, height * 0.07);
    ctx.stroke();

    // Floating Code Particles
    particles.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx;
      if (p.y < 0) p.y = height;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.fillStyle = `rgba(217, 255, 103, ${p.alpha})`;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(p.char, p.x, p.y);
    });

    requestAnimationFrame(renderCoder);
  }
  renderCoder();

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });
}

/* ==========================================================
   9. 3D TILT EFFECT ON CARDS
   ========================================================== */
function initTiltEffect() {
  const tiltCards = document.querySelectorAll('.tilt');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -12;
      const ry = ((x / rect.width) - 0.5) * 12;
      card.style.setProperty('--rx', `${rx}deg`);
      card.style.setProperty('--ry', `${ry}deg`);
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

/* ==========================================================
   10. SCROLL REVEAL OBSERVER
   ========================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach((r) => observer.observe(r));
}

/* ==========================================================
   INITIALIZATION
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initClipboardActions();
  initHeroCinema();
  initCounters();
  initTerminal();
  initSagaLedger();
  initTopologyCanvas();
  initAboutCoderCanvas();
  initTiltEffect();
  initScrollReveal();
});
