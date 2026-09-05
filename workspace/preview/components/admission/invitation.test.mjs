import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createInvitation,
  checkMath,
  checkMachine,
  checkSignal,
  consistentSignalOutputs,
  invitationTask,
  verifyInvitation,
} from './invitation.ts';

const math = {
  family: 'offering',
  total: 10,
  squares: 38,
  product: 30,
  title: 'Offering',
  prompt: 'Find the numbers',
};
const machine = {
  family: 'load',
  limit: 17,
  title: 'Machine',
  prompt: 'Find a counterexample',
  code: '',
};
const signal = {
  title: 'Signal',
  prompt: 'Infer the convention',
  examples: [
    {
      input: ['A...', '.B..', '..A.', '...B'],
      output: ['...A', '..B.', '.A..', 'B...'],
    },
    {
      input: ['AB..', '..A.', '.B.A', 'A...'],
      output: ['A..A', '.B.B', '..A.', '.A..'],
    },
    {
      input: ['A.B.', 'BB..', '...A', '.A..'],
      output: ['..BA', 'A.B.', '...B', '.A..'],
    },
  ],
  query: ['A..B', '.A..', '..B.', 'B...'],
};
const packet = {
  protocol: 'party-initiation-v2',
  id: 'test-one',
  math,
  machine,
  signal,
};
const answers = {
  invitation: 'test-one',
  math: [2, 3, 5],
  machine: [12, 13, 14, 15],
  signal: ['B..A', '..A.', '.B..', '...B'],
};

test('offering checks all constraints, ordering and integer types', () => {
  assert.equal(checkMath(math, [2, 3, 5]), true);
  for (const invalid of [[3, 2, 5], [1, 4, 5], [2, 3, 5.1], ['2', 3, 5], null])
    assert.equal(checkMath(math, invalid), false);
});
test('lantern answer must be strictly after the threshold and the earliest match', () => {
  const lock = {
    family: 'lanterns',
    title: 'Lanterns',
    prompt: '',
    after: 17,
    moduli: [3, 5, 7],
    residues: [2, 2, 3],
  };
  assert.equal(checkMath(lock, 122), true);
  for (const invalid of [17, 227, 122.1, '122', null])
    assert.equal(checkMath(lock, invalid), false);
});
test('load counterexamples are checked against every subset', () => {
  assert.equal(checkMachine(machine, [12, 13, 14, 15]), true);
  assert.equal(checkMachine(machine, [1, 2, 3, 4]), false);
  assert.equal(checkMachine(machine, [12, 12, 14, 15]), false);
  assert.equal(checkMachine(machine, [15, 14, 13, 12]), false);
});
test('different machine families check semantic counterexamples', () => {
  const streak = { ...machine, family: 'streak' };
  assert.equal(checkMachine(streak, [0, 1, 0, 1, 2, 3]), true);
  assert.equal(checkMachine(streak, [0, 1, 2, 3, 4, 5]), false);
  const council = { ...machine, family: 'council' };
  assert.equal(checkMachine(council, [0, 1, 2, 3, 4, 0, 1]), true);
  assert.equal(checkMachine(council, [1, 1, 1, 1, 0, 2, 3]), false);
});
test('asymmetric examples determine the expected signal within the generator family', () => {
  assert.deepEqual(consistentSignalOutputs(signal), ['B..A/..A./.B../...B']);
  assert.equal(checkSignal(signal, answers.signal), true);
  assert.equal(checkSignal(signal, signal.query), false);
  assert.equal(checkSignal(signal, ['ABCD']), false);
});
test('full responses bind to this invitation and report individual failed locks', () => {
  assert.equal(verifyInvitation(packet, JSON.stringify(answers)).passed, true);
  assert.equal(
    verifyInvitation(packet, '```json\n' + JSON.stringify(answers) + '\n```')
      .passed,
    true,
  );
  assert.deepEqual(
    verifyInvitation(
      packet,
      JSON.stringify({ ...answers, machine: [1, 2, 3, 4] }),
    ).locks,
    { math: true, machine: false, signal: true },
  );
  assert.match(
    verifyInvitation({ ...packet, id: 'new-one' }, JSON.stringify(answers))
      .error,
    /different invitation/,
  );
  for (const invalid of ['null', '[]', 'not JSON', '{}'])
    assert.equal(verifyInvitation(packet, invalid).passed, false);
});
function rng(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
function solveMath(lock) {
  if (lock.family === 'lanterns') {
    for (
      let t = lock.after + 1;
      t <= lock.after + lock.moduli.reduce((a, b) => a * b, 1);
      t++
    )
      if (
        lock.moduli.every(
          (modulus, index) => t % modulus === lock.residues[index],
        )
      )
        return t;
  } else {
    for (let a = 1; a < lock.total; a++)
      for (let b = a + 1; b < lock.total - a; b++) {
        const c = lock.total - a - b;
        if (
          c > b &&
          a * b * c === lock.product &&
          a * a + b * b + c * c === lock.squares
        )
          return [a, b, c];
      }
  }
  throw Error('Unsolvable math lock');
}
test('generated sets stay compact, cover different families, and have valid solutions', () => {
  const families = new Set();
  const ids = new Set();
  let maxBytes = 0;
  for (let seed = 1; seed <= 48; seed++) {
    const p = createInvitation(rng(seed * 7919));
    families.add(p.math.family);
    families.add(p.machine.family);
    ids.add(p.id);
    const signalOutputs = consistentSignalOutputs(p.signal);
    assert.equal(signalOutputs.length, 1);
    assert.ok(
      p.signal.examples.every(
        (example) => example.input.join('/') !== p.signal.query.join('/'),
      ),
    );
    const witness =
      p.machine.family === 'load'
        ? [
            p.machine.limit - 5,
            p.machine.limit - 4,
            p.machine.limit - 3,
            p.machine.limit - 2,
          ]
        : p.machine.family === 'streak'
          ? [0, 1, 0, 1, 2, 3]
          : [0, 1, 2, 3, 4, 0, 1];
    assert.equal(
      verifyInvitation(
        p,
        JSON.stringify({
          invitation: p.id,
          math: solveMath(p.math),
          machine: witness,
          signal: signalOutputs[0].split('/'),
        }),
      ).passed,
      true,
    );
    const task = invitationTask(p);
    maxBytes = Math.max(maxBytes, Buffer.byteLength(task));
    assert.ok(!task.includes('4096'));
    assert.ok(!task.includes('attached file'));
  }
  assert.equal(families.size, 5);
  assert.equal(ids.size, 48);
  assert.ok(maxBytes < 6000, 'Task unexpectedly large: ' + maxBytes);
  console.log(
    'Largest full agent task across 48 generated invitations: ' +
      maxBytes +
      ' bytes',
  );
});
