import assert from 'node:assert/strict';
import test from 'node:test';
import { chamberAt, constrainWalk, readWalkInput } from './navigation.ts';

test('the central passage connects all three chambers', () => {
  assert.deepEqual(constrainWalk({ x: 0, z: 0 }, { x: 0, z: -5 }), {
    x: 0,
    z: -5,
  });
  assert.deepEqual(constrainWalk({ x: 0, z: -19 }, { x: 0, z: -23 }), {
    x: 0,
    z: -23,
  });
});
test('a long step cannot pass through a partition outside its doorway', () => {
  assert.deepEqual(constrainWalk({ x: 5, z: 0 }, { x: 5, z: -5 }), {
    x: 5,
    z: 0,
  });
  assert.deepEqual(constrainWalk({ x: 6, z: -19 }, { x: 6, z: -23 }), {
    x: 6,
    z: -19,
  });
});
test('walking stays inside the exterior walls', () => {
  assert.deepEqual(constrainWalk({ x: 0, z: 5 }, { x: 20, z: 5 }), {
    x: 7.4,
    z: 5,
  });
  assert.deepEqual(constrainWalk({ x: 0, z: 5 }, { x: -20, z: 5 }), {
    x: -7.4,
    z: 5,
  });
  assert.deepEqual(constrainWalk({ x: 0, z: 20 }, { x: 0, z: 100 }), {
    x: 0,
    z: 22,
  });
});
test('the removed freestanding props no longer block movement', () => {
  assert.deepEqual(constrainWalk({ x: -3.5, z: 12 }, { x: -3.5, z: 6 }), {
    x: -3.5,
    z: 6,
  });
  assert.deepEqual(constrainWalk({ x: 4, z: -7 }, { x: 4, z: -12 }), {
    x: 4,
    z: -12,
  });
});
test('visitors can approach every mural without a prop in the way', () => {
  for (const z of [6, -12, -30]) {
    for (const x of [-7.2, 7.2])
      assert.deepEqual(constrainWalk({ x: 0, z }, { x, z }), { x, z });
  }
});
test('the throne remains solid at the end of the hall', () => {
  assert.deepEqual(constrainWalk({ x: 0, z: -34 }, { x: 0, z: -39 }), {
    x: 0,
    z: -34,
  });
});
test('horizontal arrow keys turn without strafing', () => {
  assert.deepEqual(readWalkInput(new Set(['arrowleft'])), {
    forward: 0,
    sideways: 0,
    turn: 1,
  });
  assert.deepEqual(readWalkInput(new Set(['arrowright'])), {
    forward: 0,
    sideways: 0,
    turn: -1,
  });
});
test('WASD movement and turning can be combined', () => {
  assert.deepEqual(readWalkInput(new Set(['a'])), {
    forward: 0,
    sideways: -1,
    turn: 0,
  });
  assert.deepEqual(readWalkInput(new Set(['w', 'arrowright'])), {
    forward: 1,
    sideways: 0,
    turn: -1,
  });
  assert.deepEqual(readWalkInput(new Set(['arrowup', 'q'])), {
    forward: 1,
    sideways: 0,
    turn: 1,
  });
});
test('chamber labels follow the actual room position', () => {
  assert.equal(chamberAt(6), 0);
  assert.equal(chamberAt(-12), 1);
  assert.equal(chamberAt(-30), 2);
});
