export type FloorPosition = { x: number; z: number };
export const portalWalls = [-3, -21] as const;
const obstacles = [{ x: 0, z: -38, radius: 2.4 }];
export function readWalkInput(keys: ReadonlySet<string>) {
  return {
    forward:
      Number(keys.has('w') || keys.has('arrowup')) -
      Number(keys.has('s') || keys.has('arrowdown')),
    sideways: Number(keys.has('d')) - Number(keys.has('a')),
    turn:
      Number(keys.has('arrowleft') || keys.has('q')) -
      Number(keys.has('arrowright') || keys.has('e')),
  };
}
function blocked(from: FloorPosition, to: FloorPosition) {
  for (const z of portalWalls) {
    const crossesWall =
      Math.min(from.z, to.z) <= z + 0.65 && Math.max(from.z, to.z) >= z - 0.65;
    if (crossesWall && Math.abs(to.x) > 2.55) return true;
  }
  for (const obstacle of obstacles) {
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const lengthSquared = dx * dx + dz * dz;
    const t = lengthSquared
      ? Math.max(
          0,
          Math.min(
            1,
            ((obstacle.x - from.x) * dx + (obstacle.z - from.z) * dz) /
              lengthSquared,
          ),
        )
      : 0;
    if (
      Math.hypot(from.x + t * dx - obstacle.x, from.z + t * dz - obstacle.z) <
      obstacle.radius
    )
      return true;
  }
  return false;
}
export function constrainWalk(
  from: FloorPosition,
  requested: FloorPosition,
): FloorPosition {
  const x = Math.max(-7.4, Math.min(7.4, requested.x));
  const z = Math.max(-36.2, Math.min(22, requested.z));
  let result = { ...from };
  const across = { x, z: from.z };
  if (!blocked(result, across)) result = across;
  const forward = { x: result.x, z };
  if (!blocked(result, forward)) result = forward;
  return result;
}
export function chamberAt(z: number) {
  return z < -21 ? 2 : z < -3 ? 1 : 0;
}
