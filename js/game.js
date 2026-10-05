/**
 * SpeedCAD - Blueprint Blitz (Game Engine & Speedrun Logic)
 */

const STAGES = [
  {
    type: 'piston',
    title: 'STUFE 1: HYDRAULIK-KOLBEN',
    desc: 'Länge, Durchmesser und Wellenbund auf Blueprint-Maß abstimmen.',
    params: [
      { id: 'diameter', label: 'Kolben-Ø (d)', min: 20, max: 60, step: 1, unit: 'mm' },
      { id: 'length', label: 'Gesamtlänge (L)', min: 40, max: 100, step: 2, unit: 'mm' },
      { id: 'collarDia', label: 'Bund-Ø (D)', min: 40, max: 80, step: 2, unit: 'mm' }
    ],
    generateTarget: () => ({
      diameter: 30 + Math.floor(Math.random() * 20),
      length: 60 + Math.floor(Math.random() * 30),
      collarDia: 60 + Math.floor(Math.random() * 15)
    }),
    build: (p) => CADPartBuilder.buildPiston(p)
  },
  {
    type: 'gear',
    title: 'STUFE 2: HOCHLEISTUNGS-STIRNRAD',
    desc: 'Zähnezahl, Modul und Zahnbreite für Getriebestufe einstellen.',
    params: [
      { id: 'teeth', label: 'Zähnezahl (z)', min: 12, max: 32, step: 1, unit: '' },
      { id: 'module', label: 'Modul (m)', min: 2.0, max: 5.0, step: 0.5, unit: 'mm' },
      { id: 'width', label: 'Zahnbreite (b)', min: 10, max: 35, step: 1, unit: 'mm' }
    ],
    generateTarget: () => ({
      teeth: 16 + Math.floor(Math.random() * 12),
      module: 2.5 + Math.floor(Math.random() * 5) * 0.5,
      width: 15 + Math.floor(Math.random() * 15)
    }),
    build: (p) => CADPartBuilder.buildGear(p)
  },
  {
    type: 'flange',
    title: 'STUFE 3: DRUCKBEHÄLTER-FLANSCH',
    desc: 'Flanschdurchmesser, Lochkreis und Schraubenanzahl konfigurieren.',
    params: [
      { id: 'flangeDia', label: 'Flansch-Ø', min: 100, max: 170, step: 5, unit: 'mm' },
      { id: 'boltCircle', label: 'Lochkreis-Ø (k)', min: 70, max: 130, step: 5, unit: 'mm' },
      { id: 'numBolts', label: 'Schraubenlöcher (n)', min: 4, max: 10, step: 2, unit: '' }
    ],
    generateTarget: () => {
      const dia = 120 + Math.floor(Math.random() * 8) * 5;
      return {
        flangeDia: dia,
        boltCircle: dia - 30,
        numBolts: 4 + Math.floor(Math.random() * 4) * 2
      };
    },
    build: (p) => CADPartBuilder.buildFlange(p)
  },
  {
    type: 'bracket',
    title: 'STUFE 4: AERO-LEICHTBAUKONSOLE',
    desc: 'Trägerabmessungen und Gewichtserleichterungsbohrung trimmen.',
    params: [
      { id: 'width', label: 'Breite (B)', min: 50, max: 110, step: 5, unit: 'mm' },
      { id: 'height', label: 'Höhe (H)', min: 40, max: 80, step: 5, unit: 'mm' },
      { id: 'cutoutR', label: 'Aussparungs-Radius (R)', min: 10, max: 28, step: 1, unit: 'mm' }
    ],
    generateTarget: () => ({
      width: 65 + Math.floor(Math.random() * 8) * 5,
      height: 45 + Math.floor(Math.random() * 6) * 5,
      cutoutR: 14 + Math.floor(Math.random() * 10)
    }),
    build: (p) => CADPartBuilder.buildBracket(p)
  },
  {
    type: 'enclosure',
    title: 'STUFE 5: AVIONIK-GEHÄUSE (FINALE)',
    desc: 'Präzisionsgehäuse mit millimetergenauer Passung fertigstellen!',
    params: [
      { id: 'length', label: 'Länge (L)', min: 70, max: 130, step: 5, unit: 'mm' },
      { id: 'width', label: 'Breite (W)', min: 50, max: 90, step: 5, unit: 'mm' },
      { id: 'height', label: 'Höhe (H)', min: 25, max: 55, step: 5, unit: 'mm' }
    ],
    generateTarget: () => ({
      length: 80 + Math.floor(Math.random() * 9) * 5,
      width: 55 + Math.floor(Math.random() * 7) * 5,
      height: 30 + Math.floor(Math.random() * 5) * 5
    }),
    build: (p) => CADPartBuilder.buildEnclosure(p)
  }
];

class SpeedCADGame {
  constructor() {
    this.stageIndex = 0;
    this.targetParams = null;
    this.playerParams = null;

    // Timer & Speedrun State
    this.running = false;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timerInterval = null;
    this.splits = [];
    this.personalBest = parseFloat(localStorage.getItem('speedcad_pb') || '0');
    this.streak = 0;
    this.penalties = 0;

    // Active selected parameter for keyboard speedrunning
    this.selectedParamIdx = 0;
    this.toleranceLocked = false;

    // 3D Scene
    this.initThree();

    // DOM bindings
    this.initUI();
    this.initHotkeys();

    // Load first level
    this.setupLevel(0);
  }

  initThree() {
    const container = document.getElementById('cad-canvas-wrap');
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 2000);
    this.camera.position.set(130, 110, 160);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;

    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(amb);

    const key = new THREE.DirectionalLight(0x00d2d3, 0.8);
    key.position.set(100, 200, 150);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xff4757, 0.4);
    fill.position.set(-100, -50, -100);
    this.scene.add(fill);

    // Grid
    this.grid = new THREE.GridHelper(260, 26, 0x00d2d3, 0x1b2838);
    this.grid.position.y = -35;
    this.scene.add(this.grid);

    // Meshes
    this.playerMesh = null;
    this.ghostMesh = null;
    this.sparkParticles = null;

    // Materials
    this.playerMat = new THREE.MeshStandardMaterial({
      color: 0x90caf9,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x002244,
      emissiveIntensity: 0.2
    });

    this.ghostMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });

    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    this.animate();
  }

  initUI() {
    this.timerEl = document.getElementById('run-timer');
    this.deltaEl = document.getElementById('run-delta');
    this.stageNameEl = document.getElementById('stage-name');
    this.stageDescEl = document.getElementById('stage-desc');
    this.stageIndicatorEl = document.getElementById('stage-indicator');
    this.controlsContainer = document.getElementById('stage-controls');
    this.blueprintSpecsEl = document.getElementById('blueprint-specs');
    this.toleranceBadgeEl = document.getElementById('tolerance-badge');
    this.commitBtn = document.getElementById('btn-commit');
    this.pbDisplayEl = document.getElementById('pb-display');

    if (this.personalBest > 0) {
      this.pbDisplayEl.textContent = this.formatTime(this.personalBest);
    }

    this.commitBtn.onclick = () => this.commitPart();
    document.getElementById('btn-restart').onclick = () => this.restartRun();
    document.getElementById('btn-sound-toggle').onclick = () => {
      const isMuted = window.soundEngine.toggleMute();
      document.getElementById('btn-sound-toggle').textContent = isMuted ? '🔇 Mute' : '🔊 Sound';
    };
  }

  initHotkeys() {
    window.addEventListener('keydown', (e) => {
      window.soundEngine.ensureContext();

      if (e.code === 'Space') {
        e.preventDefault();
        this.commitPart();
        return;
      }

      if (e.key.toLowerCase() === 'r') {
        this.restartRun();
        return;
      }

      // Hotkeys [1] to [4] select parameter
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        const stage = STAGES[this.stageIndex];
        if (idx < stage.params.length) {
          this.selectedParamIdx = idx;
          this.highlightSelectedParam();
          window.soundEngine.playTick();
        }
        return;
      }

      // [Left] / [Right] or [A] / [D] modify value
      if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        const stage = STAGES[this.stageIndex];
        const paramDef = stage.params[this.selectedParamIdx];
        if (!paramDef) return;

        const multiplier = e.shiftKey ? 5 : 1;
        const dir = (e.code === 'ArrowRight' || e.code === 'KeyD') ? 1 : -1;
        const newVal = this.playerParams[paramDef.id] + dir * paramDef.step * multiplier;

        this.setParamValue(paramDef.id, newVal);
        window.soundEngine.playTick();
      }
    });
  }

  setupLevel(stageIdx) {
    this.stageIndex = stageIdx;
    const stage = STAGES[stageIdx];

    this.stageNameEl.textContent = stage.title;
    this.stageDescEl.textContent = stage.desc;
    this.stageIndicatorEl.textContent = `STUFE ${stageIdx + 1} / ${STAGES.length}`;

    // Generate Blueprint Target
    this.targetParams = stage.generateTarget();

    // Start player with random offsets (error)
    this.playerParams = {};
    stage.params.forEach(p => {
      const targetVal = this.targetParams[p.id];
      const offset = (Math.random() > 0.5 ? 1 : -1) * (p.step * Math.floor(4 + Math.random() * 8));
      this.playerParams[p.id] = Math.max(p.min, Math.min(p.max, targetVal + offset));
    });

    this.selectedParamIdx = 0;
    this.renderBlueprintSpecs(stage);
    this.renderControls(stage);
    this.update3DObjects();
    this.checkTolerance();
  }

  renderBlueprintSpecs(stage) {
    let html = '';
    stage.params.forEach((p, idx) => {
      const val = this.targetParams[p.id];
      html += `
        <div class="spec-line">
          <span class="spec-label">[${idx + 1}] ${p.label}:</span>
          <span class="spec-target">${val} ${p.unit}</span>
        </div>
      `;
    });
    this.blueprintSpecsEl.innerHTML = html;
  }

  renderControls(stage) {
    this.controlsContainer.innerHTML = '';

    stage.params.forEach((p, idx) => {
      const row = document.createElement('div');
      row.className = `param-box ${idx === this.selectedParamIdx ? 'selected' : ''}`;
      row.id = `pbox-${idx}`;
      row.innerHTML = `
        <div class="param-top">
          <span class="param-tag">[${idx + 1}] ${p.label}</span>
          <span class="param-cur-val" id="disp-${p.id}">${this.playerParams[p.id]} ${p.unit}</span>
        </div>
        <div class="slider-wrap">
          <input type="range" class="speed-slider" id="slider-${p.id}"
                 min="${p.min}" max="${p.max}" step="${p.step}" value="${this.playerParams[p.id]}">
        </div>
      `;

      const slider = row.querySelector(`#slider-${p.id}`);
      slider.oninput = (e) => {
        window.soundEngine.ensureContext();
        this.selectedParamIdx = idx;
        this.highlightSelectedParam();
        this.setParamValue(p.id, parseFloat(e.target.value));
        window.soundEngine.playTick();
      };

      row.onclick = () => {
        this.selectedParamIdx = idx;
        this.highlightSelectedParam();
      };

      this.controlsContainer.appendChild(row);
    });
  }

  highlightSelectedParam() {
    document.querySelectorAll('.param-box').forEach((box, i) => {
      box.classList.toggle('selected', i === this.selectedParamIdx);
    });
  }

  setParamValue(paramId, value) {
    const stage = STAGES[this.stageIndex];
    const def = stage.params.find(p => p.id === paramId);
    if (!def) return;

    // Start timer on first user input!
    if (!this.running && this.stageIndex === 0 && this.elapsedTime === 0) {
      this.startTimer();
    }

    const clamped = Math.max(def.min, Math.min(def.max, value));
    this.playerParams[paramId] = clamped;

    // Update display & slider
    const disp = document.getElementById(`disp-${paramId}`);
    if (disp) disp.textContent = `${clamped} ${def.unit}`;
    const slider = document.getElementById(`slider-${paramId}`);
    if (slider) slider.value = clamped;

    this.update3DObjects();
    this.checkTolerance();
  }

  update3DObjects() {
    const stage = STAGES[this.stageIndex];

    // 1. Player mesh
    if (this.playerMesh) {
      this.scene.remove(this.playerMesh);
      if (this.playerMesh.geometry) this.playerMesh.geometry.dispose();
    }
    const playerGeom = stage.build(this.playerParams);
    this.playerMesh = new THREE.Mesh(playerGeom, this.playerMat);
    this.scene.add(this.playerMesh);

    // 2. Blueprint Ghost Target mesh
    if (this.ghostMesh) {
      this.scene.remove(this.ghostMesh);
      if (this.ghostMesh.geometry) this.ghostMesh.geometry.dispose();
    }
    const targetGeom = stage.build(this.targetParams);
    this.ghostMesh = new THREE.Mesh(targetGeom, this.ghostMat);
    this.scene.add(this.ghostMesh);
  }

  checkTolerance() {
    const stage = STAGES[this.stageIndex];
    let maxError = 0;
    let totalError = 0;

    stage.params.forEach(p => {
      const err = Math.abs(this.playerParams[p.id] - this.targetParams[p.id]);
      if (err > maxError) maxError = err;
      totalError += err;
    });

    const badge = this.toleranceBadgeEl;

    if (maxError === 0) {
      badge.textContent = 'PERFEKT: ±0.00 mm (IT6)';
      badge.className = 'tolerance-pill perfect';
      this.playerMat.emissive.setHex(0x00ff88);
      this.playerMat.emissiveIntensity = 0.45;
      if (!this.toleranceLocked) {
        window.soundEngine.playToleranceLock();
        this.toleranceLocked = true;
      }
    } else if (maxError <= 1.0) {
      badge.textContent = `IN TOLERANZ: ±${maxError.toFixed(1)} mm`;
      badge.className = 'tolerance-pill in-spec';
      this.playerMat.emissive.setHex(0x00d2d3);
      this.playerMat.emissiveIntensity = 0.35;
      if (!this.toleranceLocked) {
        window.soundEngine.playToleranceLock();
        this.toleranceLocked = true;
      }
    } else if (maxError <= 5.0) {
      badge.textContent = `NAH DRAN: ±${maxError.toFixed(1)} mm`;
      badge.className = 'tolerance-pill close';
      this.playerMat.emissive.setHex(0xffaa00);
      this.playerMat.emissiveIntensity = 0.2;
      this.toleranceLocked = false;
    } else {
      badge.textContent = `AUSSERHALB: ±${maxError.toFixed(1)} mm`;
      badge.className = 'tolerance-pill out';
      this.playerMat.emissive.setHex(0xff0044);
      this.playerMat.emissiveIntensity = 0.2;
      this.toleranceLocked = false;
    }

    return maxError <= 1.0;
  }

  commitPart() {
    window.soundEngine.ensureContext();
    if (!this.running && this.stageIndex === 0) {
      this.startTimer();
    }

    const inTolerance = this.checkTolerance();

    if (inTolerance) {
      // SUCCESS!
      window.soundEngine.playHydraulicStamp();
      this.triggerSparks();
      this.streak++;

      // Record split
      const currentSplitTime = this.elapsedTime;
      this.splits.push({
        stage: this.stageIndex + 1,
        time: currentSplitTime
      });

      // Update split table in UI
      this.renderSplitUI(this.stageIndex, currentSplitTime);

      if (this.stageIndex + 1 < STAGES.length) {
        this.toleranceLocked = false;
        this.setupLevel(this.stageIndex + 1);
      } else {
        // SPEEDRUN FINISHED!
        this.finishRun();
      }
    } else {
      // REJECTED / TIME PENALTY
      window.soundEngine.playScrapPenalty();
      this.penalties++;
      this.elapsedTime += 3.0; // 3 seconds penalty!
      this.showPenaltyFlash('+3.00s AUSSCHUSS-STRAFE!');
    }
  }

  triggerSparks() {
    const flash = document.getElementById('screen-flash');
    flash.classList.add('flash-green');
    setTimeout(() => flash.classList.remove('flash-green'), 180);
  }

  showPenaltyFlash(text) {
    const pEl = document.getElementById('penalty-banner');
    pEl.textContent = text;
    pEl.classList.add('active');
    setTimeout(() => pEl.classList.remove('active'), 800);
  }

  startTimer() {
    this.running = true;
    this.startTime = performance.now() - this.elapsedTime * 1000;
    this.timerInterval = setInterval(() => {
      this.elapsedTime = (performance.now() - this.startTime) / 1000;
      this.timerEl.textContent = this.formatTime(this.elapsedTime);

      // Delta comparison vs PB
      if (this.personalBest > 0) {
        const delta = this.elapsedTime - (this.personalBest * ((this.stageIndex + 1) / STAGES.length));
        if (delta < 0) {
          this.deltaEl.textContent = `-${Math.abs(delta).toFixed(2)}s`;
          this.deltaEl.className = 'timer-delta ahead';
        } else {
          this.deltaEl.textContent = `+${delta.toFixed(2)}s`;
          this.deltaEl.className = 'timer-delta behind';
        }
      }
    }, 25);
  }

  stopTimer() {
    this.running = false;
    clearInterval(this.timerInterval);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }

  renderSplitUI(stageIdx, splitTime) {
    const splitRow = document.getElementById(`split-row-${stageIdx}`);
    if (splitRow) {
      splitRow.querySelector('.split-time').textContent = this.formatTime(splitTime);
      splitRow.classList.add('completed');
    }
  }

  finishRun() {
    this.stopTimer();
    window.soundEngine.playVictory();

    const isNewPB = (this.personalBest === 0 || this.elapsedTime < this.personalBest);
    if (isNewPB) {
      this.personalBest = this.elapsedTime;
      localStorage.setItem('speedcad_pb', this.personalBest.toString());
      this.pbDisplayEl.textContent = this.formatTime(this.personalBest);
    }

    // Show Victory Screen
    const modal = document.getElementById('victory-modal');
    document.getElementById('final-time-val').textContent = this.formatTime(this.elapsedTime);
    document.getElementById('final-pb-status').textContent = isNewPB ? '🏆 NEUER WELTREKORD / PERSONAL BEST!' : `PB: ${this.formatTime(this.personalBest)}`;
    document.getElementById('final-penalties').textContent = `Fehlversuche: ${this.penalties}`;

    let rank = 'S+';
    if (this.elapsedTime > 60) rank = 'A';
    if (this.elapsedTime > 90) rank = 'B';
    if (this.elapsedTime > 120) rank = 'C';
    document.getElementById('final-rank').textContent = rank;

    modal.classList.add('visible');
  }

  restartRun() {
    this.stopTimer();
    this.elapsedTime = 0;
    this.splits = [];
    this.penalties = 0;
    this.streak = 0;
    this.toleranceLocked = false;
    this.timerEl.textContent = '00:00.000';
    this.deltaEl.textContent = '+0.00s';
    this.deltaEl.className = 'timer-delta';

    // Reset split rows in UI
    document.querySelectorAll('.split-item').forEach(row => {
      row.classList.remove('completed');
      row.querySelector('.split-time').textContent = '--:--.---';
    });

    document.getElementById('victory-modal').classList.remove('visible');
    this.setupLevel(0);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Rotate holographic ghost slightly to emphasize 3D blueprint
    if (this.ghostMesh) {
      this.ghostMesh.rotation.y += 0.003;
    }
    if (this.playerMesh) {
      this.playerMesh.rotation.y = this.ghostMesh.rotation.y;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.speedCad = new SpeedCADGame();
});
