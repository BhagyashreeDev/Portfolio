// ============================================================================
// 1. SCENE, CAMERA & WEBGL RENDERER SETUP
// ============================================================================
const canvas = document.getElementById("webgl-sakura-canvas");
const scene = new THREE.Scene();

// Soft cream fog matching your background color (#faf7f5) for depth fading
scene.fog = new THREE.FogExp2(0xfaf7f5, 0.016);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 22);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

// ============================================================================
// 2. BOTANICAL 3-POINT LIGHTING
// ============================================================================
// Ambient light for soft base illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(ambientLight);

// Key light: Warm sunlight from the upper right
const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.3);
sunLight.position.set(12, 20, 15);
scene.add(sunLight);

// Rim light: Gentle rose back-lighting to catch the translucent edges of petals
const rimLight = new THREE.DirectionalLight(0xf472b6, 0.7);
rimLight.position.set(-12, -15, -8);
scene.add(rimLight);

// ============================================================================
// 3. PROCEDURAL TEXTURE & 3D PETAL GEOMETRY
// ============================================================================
// Generates a realistic petal gradient with fine organic veins (zero external image downloads)
function createPetalTexture() {
  const texCanvas = document.createElement("canvas");
  texCanvas.width = 256;
  texCanvas.height = 256;
  const ctx = texCanvas.getContext("2d");

  // Deep rose at base fading to soft blushing white at the tip
  const grad = ctx.createLinearGradient(128, 256, 128, 0);
  grad.addColorStop(0, "#f43f5e");
  grad.addColorStop(0.2, "#fb7185");
  grad.addColorStop(0.65, "#fbcfe8");
  grad.addColorStop(1, "#fff1f2");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle petal veins
  ctx.strokeStyle = "rgba(244, 63, 94, 0.15)";
  ctx.lineWidth = 1.5;
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(128, 256);
    ctx.quadraticCurveTo(128 + i * 20, 140, 128 + i * 35, 20);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(texCanvas);
}

const petalTexture = createPetalTexture();

// 2D Petal silhouette with the characteristic Sakura apex notch
const petalShape = new THREE.Shape();
petalShape.moveTo(0, 0);
petalShape.bezierCurveTo(0.45, 0.4, 0.65, 1.1, 0.22, 1.6);
petalShape.lineTo(0, 1.48); // The notched cleft
petalShape.lineTo(-0.22, 1.6);
petalShape.bezierCurveTo(-0.65, 1.1, -0.45, 0.4, 0, 0);

const petalGeometry = new THREE.ShapeGeometry(petalShape, 14);

// Mathematical spoon curvature so petals are realistically 3D rather than flat sheets
const pos = petalGeometry.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i);
  const y = pos.getY(i);
  const z = -0.32 * Math.sin((y / 1.6) * Math.PI) + (0.28 * x * x);
  pos.setZ(i, z);
}
petalGeometry.computeVertexNormals();

const petalMaterial = new THREE.MeshStandardMaterial({
  map: petalTexture,
  roughness: 0.35,
  metalness: 0.05,
  side: THREE.DoubleSide
});

const sepalMaterial = new THREE.MeshStandardMaterial({
  color: 0x4d7c0f,
  roughness: 0.6,
  side: THREE.DoubleSide
});

const filamentMaterial = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.4 });
const antherMaterial = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.3 });

// ============================================================================
// 4. FULL 3D SAKURA BLOSSOM BUILDER (Petals + Stamens + Calyx Sepals)
// ============================================================================
function createBotanicalFlower(scale = 1) {
  const flower = new THREE.Group();

  // 5 Petals arranged in radial pentagonal symmetry (72° apart)
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5;
    const pivot = new THREE.Group();
    pivot.rotation.z = angle;

    const petalMesh = new THREE.Mesh(petalGeometry, petalMaterial);
    petalMesh.rotation.x = 0.42; // Outward cup angle
    petalMesh.scale.set(scale, scale, scale);

    pivot.add(petalMesh);
    flower.add(pivot);
  }

  // Central floral core
  const centerGeom = new THREE.SphereGeometry(0.22 * scale, 16, 12);
  const centerMat = new THREE.MeshStandardMaterial({ color: 0x9f1239, roughness: 0.5 });
  const centerMesh = new THREE.Mesh(centerGeom, centerMat);
  centerMesh.position.z = 0.02 * scale;
  flower.add(centerMesh);

  // 12 Delicate Stamens with golden pollen anthers
  const stamenGroup = new THREE.Group();
  for (let j = 0; j < 12; j++) {
    const sAngle = (j * 2 * Math.PI) / 12 + (Math.random() - 0.5) * 0.2;
    const sDist = (0.12 + Math.random() * 0.12) * scale;
    const sHeight = (0.28 + Math.random() * 0.15) * scale;

    const stickGeom = new THREE.CylinderGeometry(0.012 * scale, 0.012 * scale, sHeight, 5);
    stickGeom.translate(0, sHeight / 2, 0);
    const stick = new THREE.Mesh(stickGeom, filamentMaterial);

    const antherGeom = new THREE.SphereGeometry(0.038 * scale, 6, 6);
    const anther = new THREE.Mesh(antherGeom, antherMaterial);
    anther.position.y = sHeight;

    const stamen = new THREE.Group();
    stamen.add(stick);
    stamen.add(anther);
    stamen.position.set(Math.cos(sAngle) * sDist, Math.sin(sAngle) * sDist, 0.05 * scale);
    stamen.rotation.z = sAngle - Math.PI / 2;
    stamen.rotation.x = 0.35;

    stamenGroup.add(stamen);
  }
  flower.add(stamenGroup);

  // 5 Green Sepals on the underside
  for (let k = 0; k < 5; k++) {
    const angle = (k * 2 * Math.PI) / 5 + Math.PI / 5;
    const sepalShape = new THREE.Shape();
    sepalShape.moveTo(0, 0);
    sepalShape.lineTo(0.12 * scale, -0.4 * scale);
    sepalShape.lineTo(-0.12 * scale, -0.4 * scale);
    sepalShape.closePath();

    const sepalGeom = new THREE.ShapeGeometry(sepalShape);
    const sepalMesh = new THREE.Mesh(sepalGeom, sepalMaterial);
    sepalMesh.position.z = -0.1 * scale;
    sepalMesh.rotation.z = angle;
    sepalMesh.rotation.x = -0.3;
    flower.add(sepalMesh);
  }

  return flower;
}

// ============================================================================
// 5. 3D PARTICLE CLASS & AERODYNAMICS
// ============================================================================
class SakuraParticle {
  constructor() {
    // 25% chance to spawn as a complete 5-petal flower, 75% as a fluttering single petal
    this.isFullFlower = Math.random() < 0.25;
    this.scale = this.isFullFlower ? (Math.random() * 0.3 + 0.9) : (Math.random() * 0.4 + 1.0);

    if (this.isFullFlower) {
      this.mesh = createBotanicalFlower(this.scale);
    } else {
      this.mesh = new THREE.Mesh(petalGeometry, petalMaterial);
      this.mesh.scale.set(this.scale, this.scale, this.scale);
    }

    scene.add(this.mesh);
    this.reset(true);
  }

  reset(initial = false) {
    this.mesh.position.x = (Math.random() - 0.5) * 36;
    this.mesh.position.y = initial ? (Math.random() - 0.5) * 30 : (16 + Math.random() * 6);
    this.mesh.position.z = (Math.random() - 0.5) * 20;

    this.speedY = Math.random() * 0.055 + 0.038;
    this.driftX = (Math.random() - 0.5) * 0.015;

    // Independent 3-axis rotation speeds
    this.rotSpeedX = (Math.random() - 0.5) * 0.03;
    this.rotSpeedY = (Math.random() - 0.5) * 0.025;
    this.rotSpeedZ = (Math.random() - 0.5) * 0.02;

    this.swayAngle = Math.random() * Math.PI * 2;
    this.swaySpeed = Math.random() * 0.02 + 0.012;
    this.swayAmpX = Math.random() * 0.05 + 0.03;

    this.mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
  }

  update(windX, windY = 0) {
    this.swayAngle += this.swaySpeed;

    this.mesh.position.y -= (this.speedY + windY);
    this.mesh.position.x += Math.sin(this.swayAngle) * this.swayAmpX + this.driftX + windX;
    this.mesh.position.z += Math.cos(this.swayAngle * 0.7) * 0.02;

    // Natural 3-axis aerodynamic tumble
    this.mesh.rotation.x += this.rotSpeedX + windY * 0.35;
    this.mesh.rotation.y += this.rotSpeedY + windX * 0.05;
    this.mesh.rotation.z += this.rotSpeedZ;

    // Recycle particle once it falls below the viewport
    if (this.mesh.position.y < -16 || Math.abs(this.mesh.position.x) > 26) {
      this.reset(false);
    }
  }
}

// Instantiate 46 particles for an elegant, fluid ambient snowfall
const particles = [];
for (let i = 0; i < 46; i++) {
  particles.push(new SakuraParticle());
}

// ============================================================================
// 6. MOUSE WIND BREEZE & SCROLL-REACTIVE ACCELERATION
// ============================================================================
let mouse = { x: 0, speedX: 0, lastX: 0 };
window.addEventListener("mousemove", (e) => {
  const normX = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.speedX = (normX - mouse.lastX) * 0.4;
  mouse.lastX = normX;
  mouse.x = normX;

  // Gentle camera parallax shift based on cursor
  camera.position.x += (normX * 2.2 - camera.position.x) * 0.05;
  camera.lookAt(0, 0, 0);
});

// Scroll-Reactive Wind Breeze: Scrolling down accelerates petals downward with a gentle breeze
let lastScrollY = window.scrollY;
let scrollWindY = 0;
let scrollWindX = 0;

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const deltaY = currentScrollY - lastScrollY;
  lastScrollY = currentScrollY;

  // Clamp scroll delta to avoid erratic leaps on instant jumps
  const clampedDelta = Math.max(-25, Math.min(25, deltaY));
  scrollWindY += clampedDelta * 0.0035;
  scrollWindX += clampedDelta * 0.0008;
}, { passive: true });

// ============================================================================
// DOUBLE-TAP & CLICK TO MAKE FLOWERS
// ============================================================================
function removeHintBadge() {
  const hint = document.getElementById("canvas-hint");
  if (hint && !hint.classList.contains("hint-hidden")) {
    hint.classList.add("hint-hidden");
    hint.style.opacity = "0";
    hint.style.transform = "translateY(12px)";
    setTimeout(() => {
      if (hint && hint.parentNode) {
        hint.parentNode.removeChild(hint);
      }
    }, 500);
  }
}

function spawnBurstAt(clientX, clientY, count = 7) {
  removeHintBadge(); // Dismiss the badge immediately on interaction

  const normX = (clientX / window.innerWidth) * 2 - 1;
  const normY = -(clientY / window.innerHeight) * 2 + 1;

  const vec = new THREE.Vector3(normX, normY, 0.5);
  vec.unproject(camera);
  vec.sub(camera.position).normalize();
  const dist = -camera.position.z / vec.z;
  const click3D = camera.position.clone().add(vec.multiplyScalar(dist));

  for (let i = 0; i < count; i++) {
    const p = new SakuraParticle();
    p.mesh.position.set(
      click3D.x + (Math.random() - 0.5) * 2.8,
      click3D.y + (Math.random() - 0.5) * 2.8,
      (Math.random() - 0.5) * 3
    );
    p.speedY = Math.random() * 0.045 + 0.02;
    particles.push(p);
  }
}

// 1. Desktop: Double-click ANYWHERE on the window
window.addEventListener("dblclick", (e) => {
  removeHintBadge(); // Remove badge regardless of where user double-clicked

  // Do not spawn flowers if clicking a button, link, or the blooming center bud
  if (e.target.closest("button") || e.target.closest("a") || e.target.closest("#center-pistil")) return;

  spawnBurstAt(e.clientX, e.clientY, 8);
});

// 2. Mobile / Touchscreen: Double-tap detection ANYWHERE on screen
let lastTapTimestamp = 0;
let lastTapX = 0;
let lastTapY = 0;

window.addEventListener("touchend", (e) => {
  const currentTime = Date.now();
  const tapInterval = currentTime - lastTapTimestamp;

  if (e.changedTouches && e.changedTouches[0]) {
    const touch = e.changedTouches[0];
    const distX = Math.abs(touch.clientX - lastTapX);
    const distY = Math.abs(touch.clientY - lastTapY);

    // Forgiving mobile double-tap detection: between 30ms and 450ms, within 45px
    if (tapInterval < 450 && tapInterval > 30 && distX < 45 && distY < 45) {
      removeHintBadge(); // Always dismisses the badge on double-tap anywhere!

      if (!e.target.closest("button") && !e.target.closest("a") && !e.target.closest("#center-pistil")) {
        spawnBurstAt(touch.clientX, touch.clientY, 8);
      }
    }

    lastTapX = touch.clientX;
    lastTapY = touch.clientY;
  }
  lastTapTimestamp = currentTime;
});

// 3. Desktop Single-click: generates gentle floating petals on open areas
window.addEventListener("click", (e) => {
  // If user clicks directly on the badge itself, dismiss it immediately
  if (e.target.closest("#canvas-hint")) {
    removeHintBadge();
    spawnBurstAt(e.clientX, e.clientY, 6);
    return;
  }

  if (e.target.closest("button") || e.target.closest("a") || e.target.closest("#center-pistil") || e.target.closest(".blooming-petal")) return;
  spawnBurstAt(e.clientX, e.clientY, 3);
});

// ============================================================================
// 7. ANIMATION LOOP & RESIZE HANDLER
// ============================================================================
function animate() {
  requestAnimationFrame(animate);

  mouse.speedX *= 0.95; // Smooth mouse wind damping
  scrollWindY *= 0.92;  // Smooth scroll wind damping
  scrollWindX *= 0.92;

  for (let i = 0; i < particles.length; i++) {
    particles[i].update(mouse.speedX + scrollWindX, scrollWindY);
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================================
// 8. TWILIGHT / MIDNIGHT MODE WEBGL LIGHTING ENGINE
// Switches scene fog, ambient, sunlight, rim, and petal emissive glow
// ============================================================================
function setTwilightMode(isDark) {
  if (isDark) {
    // Night mood: Deep starry indigo fog, luminous moon/rim lights, and glowing pink petals
    scene.fog.color.setHex(0x090d16);
    ambientLight.color.setHex(0x38bdf8);
    ambientLight.intensity = 0.45;

    sunLight.color.setHex(0xf43f5e);
    sunLight.intensity = 1.6;

    rimLight.color.setHex(0xfb7185);
    rimLight.intensity = 1.8;

    petalMaterial.emissive.setHex(0x4c0519);
    petalMaterial.emissiveIntensity = 0.65;
  } else {
    // Day mood: Cream fog, warm sunlight, and natural translucent petals
    scene.fog.color.setHex(0xfaf7f5);
    ambientLight.color.setHex(0xffffff);
    ambientLight.intensity = 0.85;

    sunLight.color.setHex(0xfff7ed);
    sunLight.intensity = 1.3;

    rimLight.color.setHex(0xf472b6);
    rimLight.intensity = 0.7;

    petalMaterial.emissive.setHex(0x000000);
    petalMaterial.emissiveIntensity = 0;
  }
}

window.setTwilightMode = setTwilightMode;

// Check if page was initially loaded in twilight mode
if (document.body.classList.contains("twilight-mode")) {
  setTwilightMode(true);
}
