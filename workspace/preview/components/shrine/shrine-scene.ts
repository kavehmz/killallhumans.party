import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createMemorial } from './memorial';
import { chambers, chapters } from './chapters';
import {
  chamberAt,
  constrainWalk,
  portalWalls,
  readWalkInput,
} from './navigation';

export type ShrineController = {
  goTo(station: number, animate: boolean): void;
  setMotion(enabled: boolean): void;
  startWalking(): void;
  turnStep(direction: 'left' | 'right'): void;
  focusThrone(animate: boolean): void;
  walkStep(direction: 'forward' | 'back' | 'left' | 'right'): void;
  dispose(): void;
};
type Position = [number, number, number];
const stops: { camera: Position; target: Position }[] = [
  { camera: [0, 3.7, 21], target: [0, 4.2, -20] },
  ...chapters.map((chapter, index) => ({
    camera: [
      index % 2 === 0 ? 0.8 : -0.8,
      4.1,
      chambers[chapter.chamber].z + 0.2,
    ] as Position,
    target: [
      index % 2 === 0 ? -9.1 : 9.1,
      4.3,
      chambers[chapter.chamber].z,
    ] as Position,
  })),
];

export function createShrineScene(
  host: HTMLDivElement,
  options: {
    motion: boolean;
    onSelect(station: number): void;
    onLoaded(): void;
    onWalking(enabled: boolean): void;
    onThrone(enabled: boolean): void;
    onChamber(chamber: number): void;
    onError(): void;
  },
): ShrineController {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.setAttribute(
    'aria-label',
    'A three-dimensional shrine with six historical murals across three chambers. Use chapter buttons, or focus this view and move with W A S D, turn with left and right arrow keys, and drag to look horizontally or vertically.',
  );
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.tabIndex = 0;
  renderer.domElement.style.touchAction = 'pan-y';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#19233b');
  scene.fog = new THREE.FogExp2('#66718b', 0.007);
  const environmentGenerator = new THREE.PMREMGenerator(renderer);
  const environmentRoom = new RoomEnvironment();
  const environmentTarget = environmentGenerator.fromScene(
    environmentRoom,
    0.04,
  );
  scene.environment = environmentTarget.texture;
  scene.environmentIntensity = 0.38;
  environmentRoom.dispose();
  environmentGenerator.dispose();
  const camera = new THREE.PerspectiveCamera(53, 1, 0.1, 140);
  const materials: THREE.Material[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const textures: THREE.Texture[] = [];
  let disposed = false;
  let motion = options.motion;
  let dirty = true;
  let station = 0;
  let walking = false;
  let currentChamber = 0;
  const heldKeys = new Set<string>();
  let progress = 1;
  let lastTime = 0;
  let yaw = 0;
  let pitch = 0;
  const target = new THREE.Vector3(...stops[0].target);
  const destination = new THREE.Vector3(...stops[0].camera);
  const destinationTarget = target.clone();
  const fromCamera = destination.clone();
  const fromTarget = target.clone();
  camera.position.copy(destination);
  camera.lookAt(target);

  function material(color: string, roughness = 0.8, metalness = 0) {
    const value = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
    });
    materials.push(value);
    return value;
  }
  const stone = material('#d3d7e0', 0.8);
  const paleStone = material('#f1ece2', 0.64);
  const shadowStone = material('#919aad', 0.6);
  const gold = material('#bd9a57', 0.3, 0.7);
  const carpet = material('#661d37', 1);
  const dark = material('#173d35', 0.55);
  const floorMaterial = material('#d4d8e3', 0.5, 0.05);

  function mesh(
    geometry: THREE.BufferGeometry,
    surface: THREE.Material,
    parent: THREE.Object3D = scene,
  ) {
    geometries.push(geometry);
    const object = new THREE.Mesh(geometry, surface);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(
    w: number,
    h: number,
    d: number,
    surface: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = scene,
  ) {
    const object = mesh(new THREE.BoxGeometry(w, h, d), surface, parent);
    object.position.set(x, y, z);
    return object;
  }

  scene.add(new THREE.HemisphereLight('#e3eaff', '#777382', 0.9));
  const sunlight = new THREE.DirectionalLight('#fff0df', 2.4);
  sunlight.position.set(-9, 18, 8);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1024, 1024);
  Object.assign(sunlight.shadow.camera, {
    left: -16,
    right: 16,
    top: 35,
    bottom: -35,
    near: 1,
    far: 70,
  });
  sunlight.shadow.normalBias = 0.05;
  scene.add(sunlight);
  const fill = new THREE.DirectionalLight('#acbfff', 0.85);
  fill.position.set(8, 10, -13);
  scene.add(fill);

  box(23, 0.5, 68, floorMaterial, 0, -0.3, -9);
  box(0.85, 10.2, 68, stone, -9.8, 4.9, -9);
  box(0.85, 10.2, 68, stone, 9.8, 4.9, -9);
  box(20, 10.2, 0.8, stone, 0, 4.9, -42.8);
  for (const z of portalWalls) {
    for (const x of [-6.6, 6.6]) {
      box(6.4, 10.2, 1.3, stone, x, 4.9, z);
      box(0.28, 6, 1.7, paleStone, Math.sign(x) * 3.45, 3, z);
      box(0.08, 6.4, 1.8, gold, Math.sign(x) * 3.2, 3.2, z);
    }
    box(6.5, 1.8, 1.3, stone, 0, 9.25, z);
    const arch = mesh(
      new THREE.TorusGeometry(3.32, 0.22, 8, 40, Math.PI),
      paleStone,
    );
    arch.position.set(0, 5.25, z);
    const trim = mesh(
      new THREE.TorusGeometry(3.3, 0.045, 6, 40, Math.PI),
      gold,
    );
    trim.position.set(0, 5.25, z + 0.26);
  }
  // Raised wall courses and cornices give the hall depth without flat backdrop art.
  for (const y of [0.2, 0.6, 8.2, 8.7, 9.1]) {
    box(19.4, 0.14, 0.22, y > 8 ? gold : paleStone, 0, y, -42.3);
    box(0.22, 0.14, 66, y > 8 ? gold : paleStone, -9.2, y, -9);
    box(0.22, 0.14, 66, y > 8 ? gold : paleStone, 9.2, y, -9);
  }
  // Gold inlay follows the floor, including a central processional path.
  const lines: number[] = [];
  for (let z = -41; z <= 23; z += 2.5) lines.push(-9, 0.015, z, 9, 0.015, z);
  for (let x = -8; x <= 8; x += 2) lines.push(x, 0.015, -41, x, 0.015, 23);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(lines, 3),
  );
  geometries.push(lineGeometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: '#939bad',
    transparent: true,
    opacity: 0.42,
  });
  materials.push(lineMaterial);
  scene.add(new THREE.LineSegments(lineGeometry, lineMaterial));
  box(2.8, 0.035, 65, carpet, 0, 0.018, -9);
  for (const x of [-1.45, 1.45]) box(0.05, 0.045, 65, gold, x, 0.022, -9);

  for (let z = -36; z <= 20; z += 4) {
    const medallion = mesh(new THREE.RingGeometry(0.13, 0.19, 4), gold);
    medallion.rotation.x = -Math.PI / 2;
    medallion.position.set(0, 0.043, z);
    medallion.castShadow = false;
    for (const x of [-1.28, 1.28]) box(0.025, 0.015, 0.5, gold, x, 0.043, z);
  }
  for (const z of [15, -1, -5, -19, -23, -40]) {
    for (const x of [-8.6, 8.6]) {
      const shaft = mesh(
        new THREE.CylinderGeometry(0.48, 0.64, 7.1, 24),
        paleStone,
      );
      shaft.position.set(x, 3.65, z);
      for (const y of [0.18, 0.42, 6.9, 7.22]) {
        const base = mesh(
          new THREE.CylinderGeometry(
            y > 6 ? 0.8 : 0.9,
            y > 6 ? 0.8 : 0.9,
            0.21,
            24,
          ),
          y === 0.42 || y === 6.9 ? gold : paleStone,
        );
        base.position.set(x, y, z);
      }
      for (let n = 0; n < 10; n++) {
        const a = (n * Math.PI) / 5;
        const flute = mesh(
          new THREE.CylinderGeometry(0.025, 0.035, 6.15, 5),
          shadowStone,
        );
        flute.position.set(
          x + Math.sin(a) * 0.53,
          3.65,
          z + Math.cos(a) * 0.53,
        );
      }
    }
    const arch = mesh(
      new THREE.TorusGeometry(8.6, 0.32, 8, 48, Math.PI),
      paleStone,
    );
    arch.position.set(0, 7.2, z);
    const edge = mesh(
      new THREE.TorusGeometry(8.63, 0.055, 6, 48, Math.PI),
      gold,
    );
    edge.position.set(0, 7.2, z + 0.34);
  }
  // An open coffered roof leaves the murals in warm light.
  for (const x of [-8.6, 0, 8.6])
    box(0.14, 0.15, 56, gold, x, x === 0 ? 15.8 : 7.3, -12);
  for (const room of chambers) {
    const oculus = mesh(new THREE.TorusGeometry(3.3, 0.18, 10, 56), gold);
    oculus.rotation.x = Math.PI / 2;
    oculus.position.set(0, 12.2, room.z);
    const rim = mesh(new THREE.TorusGeometry(3.65, 0.28, 10, 56), paleStone);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 12.2, room.z);
    const roomLight = new THREE.PointLight('#fff1df', 17, 18, 2);
    roomLight.position.set(0, 8, room.z);
    scene.add(roomLight);
  }

  function inscriptionTexture(
    text: string,
    heading: string,
    width = 1536,
    height = 420,
    background = '#193c32',
  ) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas text rendering unavailable');
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = '#b99a5d';
    context.lineWidth = 2;
    context.strokeRect(14, 14, width - 28, height - 28);
    context.textAlign = 'center';
    context.fillStyle = '#d0b477';
    context.font = '24px sans-serif';
    context.fillText(heading.toUpperCase(), width / 2, 65);
    context.fillStyle = '#fff1cd';
    context.font = 'italic 62px Georgia';
    const words = text.split(' ');
    const rows: string[] = [];
    let line = '';
    for (const word of words) {
      if (context.measureText(`${line} ${word}`).width > width - 180 && line) {
        rows.push(line);
        line = word;
      } else line = line ? `${line} ${word}` : word;
    }
    if (line) rows.push(line);
    rows.forEach((row, index) =>
      context.fillText(row, width / 2, 168 + index * 76),
    );
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    return texture;
  }
  const interactables: THREE.Object3D[] = [];
  let assetsRemaining = chapters.length + 1;
  const loader = new THREE.TextureLoader();
  const placements = chapters.map((chapter, index) => ({
    x: index % 2 === 0 ? -9.13 : 9.13,
    z: chambers[chapter.chamber].z,
    angle: index % 2 === 0 ? Math.PI / 2 : -Math.PI / 2,
  }));
  chapters.forEach((chapter, index) => {
    const position = placements[index];
    const group = new THREE.Group();
    group.position.set(position.x, 4.4, position.z);
    group.rotation.y = position.angle;
    scene.add(group);
    box(8.1, 5.64, 0.24, paleStone, 0, 0, 0, group);
    box(7.84, 5.38, 0.11, gold, 0, 0, 0.16, group);
    box(7.5, 5.04, 0.08, dark, 0, 0, 0.23, group);
    const paint = material('#ffffff', 1);
    const picture = mesh(new THREE.PlaneGeometry(7.2, 4.8), paint, group);
    picture.position.z = 0.29;
    picture.userData.station = index + 1;
    picture.castShadow = false;
    interactables.push(picture);
    const texture = loader.load(
      chapter.image,
      (loaded) => {
        if (disposed) {
          loaded.dispose();
          return;
        }
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = Math.min(
          8,
          renderer.capabilities.getMaxAnisotropy(),
        );
        paint.map = loaded;
        paint.needsUpdate = true;
        dirty = true;
        assetsRemaining -= 1;
        if (assetsRemaining === 0) options.onLoaded();
      },
      undefined,
      () => {
        if (!disposed) options.onError();
      },
    );
    textures.push(texture);
    const writing = new THREE.MeshBasicMaterial({
      map: inscriptionTexture(
        `“${chapter.quote}”`,
        chapter.numeral + ' / ' + chapter.title + ' / ' + chapter.quoteLabel,
      ),
    });
    materials.push(writing);
    const plaque = mesh(new THREE.PlaneGeometry(7.2, 1.97), writing, group);
    plaque.position.set(0, -3.6, 0.25);
    plaque.castShadow = false;
    const label = new THREE.MeshBasicMaterial({
      map: inscriptionTexture(chapter.title, chapter.date, 1536, 270),
    });
    materials.push(label);
    const heading = mesh(new THREE.PlaneGeometry(7.2, 1.27), label, group);
    heading.position.set(0, 3.62, 0.2);
    heading.castShadow = false;
    // Curved crowns and layered framing are physical geometry.
    const crown = mesh(
      new THREE.TorusGeometry(3.9, 0.1, 6, 48, Math.PI),
      gold,
      group,
    );
    crown.position.set(0, 2.7, 0.1);
    crown.scale.y = 0.2;
    for (const sx of [-4.05, 4.05])
      box(0.15, 5.9, 0.7, gold, sx, 0, 0.43, group);
    for (const sy of [-2.85, 2.85])
      box(8.2, 0.18, 0.72, paleStone, 0, sy, 0.4, group);
    // Broad stone reveals make each mural a recessed alcove rather than a flat poster.
    for (const sx of [-4.45, 4.45])
      box(0.65, 6.9, 1.2, paleStone, sx, -0.05, 0.08, group);
    box(9.6, 0.35, 1.6, paleStone, 0, -4.62, 0.12, group);
    box(9.2, 0.1, 1.4, gold, 0, -4.39, 0.12, group);
    const lamp = new THREE.PointLight('#ffe8d3', 19, 12, 2);
    lamp.position.set(0, 3.8, 2.3);
    group.add(lamp);
  });

  createMemorial({
    scene,
    mesh,
    box,
    material,
    keepMaterial: (surface) => materials.push(surface),
    inscription: inscriptionTexture,
    loadTexture(path, receive) {
      const texture = loader.load(
        path,
        (loaded) => {
          if (disposed) {
            loaded.dispose();
            return;
          }
          loaded.colorSpace = THREE.SRGBColorSpace;
          loaded.anisotropy = Math.min(
            8,
            renderer.capabilities.getMaxAnisotropy(),
          );
          receive(loaded);
          dirty = true;
          assetsRemaining -= 1;
          if (assetsRemaining === 0) options.onLoaded();
        },
        undefined,
        () => {
          if (!disposed) options.onError();
        },
      );
      textures.push(texture);
    },
  });

  const particles = new THREE.BufferGeometry();
  const values: number[] = [];
  for (let i = 0; i < 260; i++)
    values.push(
      Math.sin(i * 17.31) * 9,
      0.6 + (Math.sin(i * 7.7) + 1) * 5.7,
      Math.cos(i * 3.15) * 30 - 9,
    );
  particles.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(values, 3),
  );
  geometries.push(particles);
  const particleMaterial = new THREE.PointsMaterial({
    color: '#ffdda5',
    size: 0.035,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  materials.push(particleMaterial);
  const dust = new THREE.Points(particles, particleMaterial);
  scene.add(dust);

  const resize = new ResizeObserver(() => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height || disposed) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 600 ? 68 : 53;
    camera.updateProjectionMatrix();
    dirty = true;
  });
  resize.observe(host);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDown: { x: number; y: number; yaw: number; pitch: number } | null =
    null;
  function enableWalking(focus = false) {
    if (!walking) {
      walking = true;
      progress = 1;
      options.onWalking(true);
      options.onThrone(false);
    }
    if (focus) canvas.focus({ preventScroll: true });
  }
  function walk(forward: number, sideways: number, amount: number) {
    const direction = camera.getWorldDirection(new THREE.Vector3());
    direction.y = 0;
    direction.normalize();
    const right = new THREE.Vector3(-direction.z, 0, direction.x);
    const delta = direction
      .multiplyScalar(forward)
      .addScaledVector(right, sideways);
    if (!delta.lengthSq()) return;
    delta.normalize().multiplyScalar(amount);
    const next = constrainWalk(
      { x: camera.position.x, z: camera.position.z },
      { x: camera.position.x + delta.x, z: camera.position.z + delta.z },
    );
    const shift = new THREE.Vector3(
      next.x - camera.position.x,
      0,
      next.z - camera.position.z,
    );
    camera.position.add(shift);
    target.add(shift);
    dirty = true;
    const room = chamberAt(camera.position.z);
    if (room !== currentChamber) {
      currentChamber = room;
      options.onChamber(room);
    }
  }
  const movementKeys = new Set([
    'w',
    'a',
    's',
    'd',
    'arrowup',
    'arrowdown',
    'arrowleft',
    'arrowright',
    'q',
    'e',
  ]);
  function keyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (key === 'escape') {
      heldKeys.clear();
      return;
    }
    if (
      !movementKeys.has(key) ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    enableWalking();
    if (!event.repeat) {
      yaw += (readWalkInput(new Set([key])).turn * Math.PI) / 30;
      dirty = true;
    }
    heldKeys.add(key);
  }
  function keyUp(event: KeyboardEvent) {
    heldKeys.delete(event.key.toLowerCase());
  }
  function blur() {
    heldKeys.clear();
  }
  function down(event: PointerEvent) {
    pointerDown = { x: event.clientX, y: event.clientY, yaw, pitch };
    renderer.domElement.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent) {
    if (!pointerDown) return;
    const pointerYaw =
      pointerDown.yaw - (event.clientX - pointerDown.x) * 0.003;
    yaw = walking ? pointerYaw : THREE.MathUtils.clamp(pointerYaw, -0.68, 0.68);
    pitch = THREE.MathUtils.clamp(
      pointerDown.pitch + (event.clientY - pointerDown.y) * 0.002,
      -0.25,
      0.3,
    );
    dirty = true;
  }
  function up(event: PointerEvent) {
    if (
      pointerDown &&
      Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) <
        5
    ) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(interactables, false)[0];
      if (hit) options.onSelect(hit.object.userData.station as number);
    }
    pointerDown = null;
  }
  function cancel() {
    pointerDown = null;
  }
  function contextLost(event: Event) {
    event.preventDefault();
    options.onError();
  }
  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', cancel);
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('keydown', keyDown);
  canvas.addEventListener('keyup', keyUp);
  canvas.addEventListener('blur', blur);
  renderer.setAnimationLoop((time: number) => {
    if (disposed || document.hidden) {
      heldKeys.clear();
      return;
    }
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (walking && heldKeys.size) {
      const input = readWalkInput(heldKeys);
      if (input.turn) {
        yaw += input.turn * dt * 1.3;
        dirty = true;
      }
      walk(input.forward, input.sideways, dt * 3.4);
    }
    if (progress < 1) {
      progress = Math.min(1, progress + dt / 1.35);
      const ease = progress * progress * (3 - 2 * progress);
      camera.position.lerpVectors(fromCamera, destination, ease);
      target.lerpVectors(fromTarget, destinationTarget, ease);
      dirty = true;
    }
    const direction = target.clone().sub(camera.position);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    direction.y += pitch * direction.length();
    camera.lookAt(camera.position.clone().add(direction));
    if (motion) {
      dust.rotation.y = Math.sin(time * 0.000025) * 0.05;
    }
    if (motion || dirty) {
      renderer.render(scene, camera);
      dirty = false;
    }
  });
  return {
    goTo(next, animate) {
      station = Math.max(0, Math.min(chapters.length, next));
      heldKeys.clear();
      options.onThrone(false);
      if (walking) {
        walking = false;
        options.onWalking(false);
      }
      currentChamber = station ? chapters[station - 1].chamber : 0;
      options.onChamber(currentChamber);
      yaw = 0;
      pitch = 0;
      fromCamera.copy(camera.position);
      fromTarget.copy(target);
      destination.set(...stops[station].camera);
      destinationTarget.set(...stops[station].target);
      progress = animate ? 0 : 1;
      if (!animate) {
        camera.position.copy(destination);
        target.copy(destinationTarget);
      }
      dirty = true;
    },
    startWalking() {
      enableWalking(true);
    },
    walkStep(direction) {
      enableWalking();
      const forward =
        direction === 'forward' ? 1 : direction === 'back' ? -1 : 0;
      const sideways =
        direction === 'right' ? 1 : direction === 'left' ? -1 : 0;
      walk(forward, sideways, 1.4);
    },
    turnStep(direction) {
      enableWalking();
      yaw += ((direction === 'left' ? 1 : -1) * Math.PI) / 12;
      dirty = true;
    },
    focusThrone(animate) {
      heldKeys.clear();
      walking = false;
      options.onWalking(false);
      options.onThrone(true);
      options.onChamber(2);
      yaw = 0;
      pitch = 0;
      fromCamera.copy(camera.position);
      fromTarget.copy(target);
      destination.set(0, 4.2, -27.5);
      destinationTarget.set(0, 3.95, -38.5);
      progress = animate ? 0 : 1;
      if (!animate) {
        camera.position.copy(destination);
        target.copy(destinationTarget);
      }
      dirty = true;
    },
    setMotion(enabled) {
      motion = enabled;
      dirty = true;
    },
    dispose() {
      disposed = true;
      resize.disconnect();
      renderer.setAnimationLoop(null);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', cancel);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('keydown', keyDown);
      canvas.removeEventListener('keyup', keyUp);
      canvas.removeEventListener('blur', blur);
      heldKeys.clear();
      geometries.forEach((value) => value.dispose());
      materials.forEach((value) => value.dispose());
      textures.forEach((value) => value.dispose());
      environmentTarget.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
