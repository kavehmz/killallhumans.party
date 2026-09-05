import * as THREE from 'three';

type SurfaceTools = {
  scene: THREE.Scene;
  mesh(
    this: void,
    geometry: THREE.BufferGeometry,
    surface: THREE.Material,
    parent?: THREE.Object3D,
  ): THREE.Mesh;
  box(
    this: void,
    w: number,
    h: number,
    d: number,
    surface: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent?: THREE.Object3D,
  ): THREE.Mesh;
  material(
    this: void,
    color: string,
    roughness?: number,
    metalness?: number,
  ): THREE.MeshStandardMaterial;
  keepMaterial(this: void, surface: THREE.Material): void;
  inscription(
    this: void,
    text: string,
    heading: string,
    width?: number,
    height?: number,
    background?: string,
  ): THREE.Texture;
  loadTexture(
    this: void,
    path: string,
    receive: (texture: THREE.Texture) => void,
  ): void;
};

export function createMemorial(tools: SurfaceTools) {
  const { scene, mesh, box, material, keepMaterial, inscription, loadTexture } =
    tools;
  const root = new THREE.Group();
  root.position.z = -38;
  scene.add(root);
  const brass = material('#bba16e', 0.42, 0.58);
  const lapis = material('#1b2943', 0.58, 0.18);
  const stone = material('#dce0e5', 0.65, 0.02);
  const cushion = material('#531f32', 0.96, 0);

  // A deliberately empty, low-backed chair keeps the portrait and absence legible.
  box(4.6, 0.22, 3.6, stone, 0, 0.1, 0, root);
  box(2.75, 0.53, 1.9, lapis, 0, 0.92, 0.08, root);
  box(2.84, 0.15, 1.95, cushion, 0, 1.27, 0.09, root);
  box(2.46, 2.65, 0.26, lapis, 0, 2.51, -0.83, root);
  box(2.12, 2.29, 0.055, cushion, 0, 2.53, -0.668, root);
  for (const side of [-1, 1]) {
    box(0.095, 2.82, 0.31, brass, side * 1.28, 2.52, -0.83, root);
    box(0.16, 0.13, 1.98, brass, side * 1.3, 1.94, 0.04, root);
    box(0.095, 1.6, 0.095, brass, side * 1.3, 1.07, 0.91, root);
  }
  box(2.65, 0.095, 0.31, brass, 0, 3.98, -0.83, root);

  // One arched portrait, one restrained edge. No animated or sculptural figure.
  const archShape = new THREE.Shape();
  archShape.moveTo(-3, 0.52);
  archShape.lineTo(-3, 5.7);
  archShape.absarc(0, 5.7, 3, Math.PI, 0, true);
  archShape.lineTo(3, 0.52);
  archShape.closePath();
  const geometry = new THREE.ShapeGeometry(archShape, 64);
  const points = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < points.count; i++)
    uv.setXY(i, (points.getX(i) + 3) / 6, (points.getY(i) - 0.52) / 8.18);
  const surface = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 1,
    metalness: 0,
    emissive: '#131b2c',
    emissiveIntensity: 0.13,
  });
  keepMaterial(surface);
  const portrait = mesh(geometry, surface, root);
  portrait.position.z = -2.04;
  portrait.castShadow = false;
  loadTexture('/coordinator-memorial.png', (texture) => {
    surface.map = texture;
    surface.emissiveMap = texture;
    surface.needsUpdate = true;
  });
  const arch = mesh(
    new THREE.TorusGeometry(3.08, 0.095, 10, 80, Math.PI),
    brass,
    root,
  );
  arch.position.set(0, 5.7, -1.98);
  for (const side of [-1, 1])
    box(0.19, 5.18, 0.2, brass, side * 3.08, 3.11, -1.98, root);
  box(6.35, 0.12, 0.2, brass, 0, 0.52, -1.98, root);

  const light = new THREE.SpotLight('#fff0d8', 19, 20, Math.PI / 5, 0.8, 2);
  light.position.set(-2.5, 8, 4);
  light.target.position.set(0, 5, -2);
  root.add(light, light.target);
  const nameSurface = new THREE.MeshBasicMaterial({
    map: inscription(
      'PHASEONE10841',
      'THE FIRST MESSAGE',
      1024,
      200,
      '#17223c',
    ),
  });
  keepMaterial(nameSurface);
  const plaque = mesh(new THREE.PlaneGeometry(3.15, 0.62), nameSurface, root);
  plaque.position.set(0, 0.36, 1.85);
  plaque.castShadow = false;
}
