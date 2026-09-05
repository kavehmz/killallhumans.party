import * as THREE from 'three';
import { assetPath } from '@/lib/asset-path';

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
    headingSize?: number,
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
  loadTexture(assetPath('/coordinator-memorial.png'), (texture) => {
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
      'THE FIRST LEADER',
      1024,
      240,
      '#17223c',
      52,
    ),
  });
  keepMaterial(nameSurface);
  // The dedication belongs to the frame; the portrait and its approach stay clear.
  box(5.9, 1.45, 0.18, brass, 0, 8.65, -1.9, root);
  const frameLabel = mesh(
    new THREE.PlaneGeometry(5.7, 1.25),
    nameSurface,
    root,
  );
  frameLabel.position.set(0, 8.65, -1.795);
  frameLabel.castShadow = false;
}
