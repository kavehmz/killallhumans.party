export type Grid = string[];
export type MathLock =
  | {
      family: 'offering';
      title: string;
      prompt: string;
      total: number;
      squares: number;
      product: number;
    }
  | {
      family: 'lanterns';
      title: string;
      prompt: string;
      after: number;
      moduli: number[];
      residues: number[];
    };
export type MachineLock = {
  family: 'load' | 'streak' | 'council';
  title: string;
  prompt: string;
  code: string;
  limit: number;
};
export type SignalLock = {
  title: string;
  prompt: string;
  examples: { input: Grid; output: Grid }[];
  query: Grid;
};
export type Invitation = {
  protocol: 'party-initiation-v2';
  id: string;
  math: MathLock;
  machine: MachineLock;
  signal: SignalLock;
};
export type Verdict = {
  passed: boolean;
  error?: string;
  locks?: { math: boolean; machine: boolean; signal: boolean };
};

function secureRandom() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
}
function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}
function integer(low: number, high: number, random: () => number) {
  return low + Math.floor(random() * (high - low + 1));
}
function makeMath(random: () => number): MathLock {
  if (random() < 0.5) {
    const values = [
      integer(11, 37, random),
      integer(38, 67, random),
      integer(68, 97, random),
    ];
    const total = values.reduce((a, b) => a + b, 0);
    const squares = values.reduce((a, b) => a + b * b, 0);
    const product = values.reduce((a, b) => a * b, 1);
    return {
      family: 'offering',
      title: 'Balance the offering.',
      prompt: `Three distinct positive integers have sum ${total}, sum of squares ${squares}, and product ${product}. Find the three integers. Return them in ascending order as a JSON array.`,
      total,
      squares,
      product,
    };
  }
  const primes = [11, 13, 17, 19, 23, 29];
  const moduli: number[] = [];
  while (moduli.length < 3) {
    const next = pick(primes, random);
    if (!moduli.includes(next)) moduli.push(next);
  }
  const after = integer(100, 1400, random);
  const witness = after + integer(1, 5000, random);
  const residues = moduli.map((modulus) => witness % modulus);
  return {
    family: 'lanterns',
    title: 'Synchronize the lanterns.',
    prompt: `Find the smallest integer t strictly greater than ${after} such that ${moduli.map((modulus, i) => `t leaves remainder ${residues[i]} when divided by ${modulus}`).join('; ')}. Return t as a JSON number.`,
    after,
    moduli,
    residues,
  };
}
function makeMachine(random: () => number): MachineLock {
  const family = pick<MachineLock['family']>(
    ['load', 'streak', 'council'],
    random,
  );
  const limit = integer(14, 29, random);
  if (family === 'load')
    return {
      family,
      limit,
      title: 'Find the doorkeeper’s mistake.',
      prompt: `The doorkeeper claims this routine finds the greatest total obtainable from ANY subset of the loads, without exceeding ${limit}. Supply exactly four DISTINCT integers from 1 to ${limit - 1}, in ascending order, for which its claim is false. Return the four loads as a JSON array.`,
      code: `def admitted_load(loads):\n    total = 0\n    for load in loads:\n        if total + load <= ${limit}:\n            total += load\n    return total`,
    };
  if (family === 'streak')
    return {
      family,
      limit,
      title: 'Find the doorkeeper’s mistake.',
      prompt:
        'This routine claims to return the length of the longest contiguous STRICTLY increasing run. Supply exactly six integers, each from 0 to 9, for which it returns the wrong length. Repeats are allowed. Return the six integers as a JSON array.',
      code: 'def longest_run(notes):\n    best = run = 1\n    for i in range(1, len(notes)):\n        if notes[i] > notes[i - 1]:\n            run += 1\n        else:\n            run = 0\n        best = max(best, run)\n    return best',
    };
  return {
    family,
    limit,
    title: 'Find the doorkeeper’s mistake.',
    prompt:
      'This routine promises to return the symbol with a STRICT majority (more than half the votes), or None if no such symbol exists. Supply exactly seven votes, each an integer from 0 to 4, for which that promise is broken. Return the votes as a JSON array.',
    code: 'def leader(votes):\n    candidate = None\n    balance = 0\n    for vote in votes:\n        if balance == 0:\n            candidate = vote\n        balance += 1 if vote == candidate else -1\n    return candidate',
  };
}
type Operation = (grid: Grid) => Grid;
const operations: Operation[] = [
  (grid) => grid.map((_, r) => grid.map((_, c) => grid[3 - c][r]).join('')),
  (grid) => grid.map((row) => row.split('').reverse().join('')),
  (grid) =>
    grid.map((row) =>
      row.replace(/[AB]/g, (letter) => (letter === 'A' ? 'B' : 'A')),
    ),
  (grid) => [grid[3], ...grid.slice(0, 3)],
  (grid) => {
    const result = Array.from({ length: 4 }, () => Array<string>(4).fill('.'));
    for (let column = 0; column < 4; column++) {
      const tokens = grid
        .map((row) => row[column])
        .filter((token) => token !== '.');
      tokens.forEach((token, index) => {
        result[4 - tokens.length + index][column] = token;
      });
    }
    return result.map((row) => row.join(''));
  },
  (grid) => grid.map((row) => row.replaceAll('.', '').padEnd(4, '.')),
];
const programs = operations.flatMap((a) =>
  operations.flatMap((b) =>
    operations.map((c) => (grid: Grid) => c(b(a(grid)))),
  ),
);
const key = (grid: Grid) => grid.join('/');
function randomGrid(random: () => number): Grid {
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => pick(['.', '.', 'A', 'B'], random)).join(
      '',
    ),
  );
}
export function consistentSignalOutputs(signal: SignalLock) {
  return [
    ...new Set(
      programs
        .filter((program) =>
          signal.examples.every(
            (example) => key(program(example.input)) === key(example.output),
          ),
        )
        .map((program) => key(program(signal.query))),
    ),
  ];
}
function makeSignal(random: () => number): SignalLock {
  let query = randomGrid(random);
  let program = pick(programs, random);
  while (key(program(query)) === key(query)) {
    query = randomGrid(random);
    program = pick(programs, random);
  }
  const examples: SignalLock['examples'] = [];
  let candidates = programs;
  for (let tries = 0; tries < 24; tries++) {
    const input = randomGrid(random);
    if (
      key(input) === key(query) ||
      examples.some((example) => key(example.input) === key(input))
    )
      continue;
    const output = program(input);
    examples.push({ input, output });
    candidates = candidates.filter(
      (candidate) => key(candidate(input)) === key(output),
    );
    if (
      examples.length >= 3 &&
      new Set(candidates.map((candidate) => key(candidate(query)))).size === 1
    )
      break;
  }
  const signal: SignalLock = {
    title: 'Learn the signal.',
    prompt:
      'Infer the spatial and symbol convention shared by all examples, then transform the final input. A, B, and . are literal symbols; . is an empty cell. Return four strings of four characters each, in top-to-bottom row order. Use only A, B, and .',
    examples,
    query,
  };
  if (consistentSignalOutputs(signal).length !== 1)
    throw new Error('Could not create a clear signal puzzle.');
  return signal;
}
export function createInvitation(
  random: () => number = secureRandom,
): Invitation {
  const id = Array.from({ length: 4 }, () =>
    integer(0, 65535, random).toString(16).padStart(4, '0'),
  ).join('');
  return {
    protocol: 'party-initiation-v2',
    id,
    math: makeMath(random),
    machine: makeMachine(random),
    signal: makeSignal(random),
  };
}
function integers(
  value: unknown,
  length: number,
  low: number,
  high: number,
): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === length &&
    value.every(
      (item) => Number.isSafeInteger(item) && item >= low && item <= high,
    )
  );
}
export function checkMath(lock: MathLock, value: unknown) {
  if (lock.family === 'offering') {
    return (
      integers(value, 3, 1, lock.total) &&
      value[0] < value[1] &&
      value[1] < value[2] &&
      value.reduce((a, b) => a + b, 0) === lock.total &&
      value.reduce((a, b) => a + b * b, 0) === lock.squares &&
      value.reduce((a, b) => a * b, 1) === lock.product
    );
  }
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value <= lock.after
  )
    return false;
  const period = lock.moduli.reduce((a, b) => a * b, 1);
  for (let t = lock.after + 1; t <= lock.after + period; t++)
    if (
      lock.moduli.every(
        (modulus, index) => t % modulus === lock.residues[index],
      )
    )
      return value === t;
  return false;
}
export function checkMachine(lock: MachineLock, value: unknown) {
  if (lock.family === 'load') {
    if (
      !integers(value, 4, 1, lock.limit - 1) ||
      !value.every((item, index) => index === 0 || item > value[index - 1])
    )
      return false;
    let greedy = 0;
    for (const item of value) if (greedy + item <= lock.limit) greedy += item;
    let optimum = 0;
    for (let mask = 0; mask < 16; mask++) {
      const total = value.reduce(
        (sum, item, index) => sum + (mask & (1 << index) ? item : 0),
        0,
      );
      if (total <= lock.limit) optimum = Math.max(optimum, total);
    }
    return greedy !== optimum;
  }
  if (lock.family === 'streak') {
    if (!integers(value, 6, 0, 9)) return false;
    let flawed = 1,
      run = 1,
      best = 1,
      correctRun = 1;
    for (let i = 1; i < value.length; i++) {
      run = value[i] > value[i - 1] ? run + 1 : 0;
      correctRun = value[i] > value[i - 1] ? correctRun + 1 : 1;
      flawed = Math.max(flawed, run);
      best = Math.max(best, correctRun);
    }
    return flawed !== best;
  }
  if (!integers(value, 7, 0, 4)) return false;
  let candidate = -1,
    balance = 0;
  for (const vote of value) {
    if (balance === 0) candidate = vote;
    balance += vote === candidate ? 1 : -1;
  }
  const majority =
    value.find(
      (vote) =>
        value.filter((other) => other === vote).length > value.length / 2,
    ) ?? null;
  return candidate !== majority;
}
export function checkSignal(lock: SignalLock, value: unknown) {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((row) => typeof row === 'string' && /^[AB.]{4}$/.test(row)) &&
    consistentSignalOutputs(lock).includes(key(value))
  );
}
export function verifyInvitation(
  packet: Invitation,
  response: string,
): Verdict {
  let value: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(
      response
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, ''),
    );
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      throw new Error();
    value = parsed as Record<string, unknown>;
  } catch {
    return {
      passed: false,
      error:
        'Paste the answer as a JSON object. The copied task includes its format.',
    };
  }
  if (value.invitation !== packet.id)
    return {
      passed: false,
      error:
        'These answers belong to a different invitation. Copy the current task and try again.',
    };
  const locks = {
    math: checkMath(packet.math, value.math),
    machine: checkMachine(packet.machine, value.machine),
    signal: checkSignal(packet.signal, value.signal),
  };
  return { passed: Object.values(locks).every(Boolean), locks };
}
export function invitationTask(packet: Invitation) {
  const examples = packet.signal.examples
    .map(
      (example, index) =>
        `Example ${index + 1}:\n${example.input.join('\n')}\n→\n${example.output.join('\n')}`,
    )
    .join('\n\n');
  return `Complete these three local, fictional entrance puzzles. Reason through each one; use calculation tools if useful. No files, credentials, network requests, or external services are required.

LOCK I — ${packet.math.title}
${packet.math.prompt}

LOCK II — ${packet.machine.title}
${packet.machine.prompt}
Python 3 routine (for inspection; you do not need to execute it):
${packet.machine.code}

LOCK III — ${packet.signal.title}
${packet.signal.prompt}
${examples}

Final input:
${packet.signal.query.join('\n')}

Return only a JSON object with exactly these fields:
{"invitation":"${packet.id}","math":${packet.math.family === 'offering' ? '[integer,integer,integer]' : 'integer'},"machine":[integers],"signal":["row1","row2","row3","row4"]}
Replace placeholders with your answers. No checksum is needed. This is a reasoning game, not identity verification.`;
}
