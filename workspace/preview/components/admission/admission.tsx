'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Braces,
  Check,
  Copy,
  Fingerprint,
  RefreshCw,
  Shapes,
  Sigma,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  createInvitation,
  invitationTask,
  verifyInvitation,
  type Grid,
  type Invitation,
  type Verdict,
} from './invitation';
import './admission.css';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: boolean;
  onAdmit: () => void;
  onEnter: () => void;
};
const lockNames = ['math', 'machine', 'signal'] as const;
const lockTitles = [
  'Find the numbers',
  'Challenge the machine',
  'Learn the convention',
];
const lockNotes = [
  'Mathematical insight',
  'A working counterexample',
  'Reasoning from examples',
];
const lockIcons = [Sigma, Braces, Shapes];
const numerals = ['I', 'II', 'III'];

function SignalGrid({ grid, label }: { grid: Grid; label: string }) {
  return (
    <figure className="signal-grid" aria-label={label + ': ' + grid.join(', ')}>
      {grid.flatMap((row, r) =>
        row.split('').map((cell, c) => (
          <span
            key={r + '-' + c}
            className={'signal-cell signal-' + (cell === '.' ? 'empty' : cell)}
            aria-hidden="true"
          >
            {cell === '.' ? '·' : cell}
          </span>
        )),
      )}
    </figure>
  );
}
function Challenge({ packet, active }: { packet: Invitation; active: number }) {
  if (active === 0)
    return (
      <>
        <h3>{packet.math.title}</h3>
        <p>{packet.math.prompt}</p>
        <div className="math-inscription" aria-hidden="true">
          {packet.math.family === 'offering' ? (
            <>
              <div>
                <span>x + y + z</span>
                <span>=</span>
                <strong>{packet.math.total}</strong>
              </div>
              <div>
                <span>x² + y² + z²</span>
                <span>=</span>
                <strong>{packet.math.squares.toLocaleString('en-US')}</strong>
              </div>
              <div>
                <span>x · y · z</span>
                <span>=</span>
                <strong>{packet.math.product.toLocaleString('en-US')}</strong>
              </div>
            </>
          ) : (
            packet.math.moduli.map((modulus, index) => (
              <div key={modulus}>
                <span>t mod {modulus}</span>
                <span>=</span>
                <strong>
                  {packet.math.family === 'lanterns'
                    ? packet.math.residues[index]
                    : ''}
                </strong>
              </div>
            ))
          )}
        </div>
        <span className="challenge-format">
          RETURN /{' '}
          {packet.math.family === 'offering'
            ? 'three integers, ascending'
            : 'the earliest valid integer'}
        </span>
      </>
    );
  if (active === 1)
    return (
      <>
        <h3>{packet.machine.title}</h3>
        <p>{packet.machine.prompt}</p>
        <pre className="machine-code">
          <code>{packet.machine.code}</code>
        </pre>
        <span className="challenge-format">
          RETURN / an input that disproves the claim
        </span>
      </>
    );
  return (
    <>
      <h3>{packet.signal.title}</h3>
      <p>
        Same convention in every example. Discover it, then transform the final
        signal.
      </p>
      <div className="signal-examples">
        {packet.signal.examples.map((example, index) => (
          <figure key={index}>
            <figcaption>EXAMPLE {index + 1}</figcaption>
            <div className="signal-pair">
              <SignalGrid
                grid={example.input}
                label={'Example ' + (index + 1) + ' input'}
              />
              <ArrowRight size={17} aria-hidden="true" />
              <SignalGrid
                grid={example.output}
                label={'Example ' + (index + 1) + ' output'}
              />
            </div>
          </figure>
        ))}
      </div>
      <div className="signal-question">
        <div>
          <span className="challenge-format">YOUR TURN</span>
          <SignalGrid grid={packet.signal.query} label="Final signal input" />
        </div>
        <ArrowRight size={20} aria-hidden="true" />
        <div className="signal-unknown" aria-hidden="true">
          ?
        </div>
        <p>
          Return four rows.
          <br />
          <span>Use A, B, and .</span>
        </p>
      </div>
    </>
  );
}

export default function Admission({
  open,
  onOpenChange,
  guest,
  onAdmit,
  onEnter,
}: Props) {
  const [packet, setPacket] = useState<Invitation | null>(null);
  const [active, setActive] = useState(0);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [inspect, setInspect] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const task = packet ? invitationTask(packet) : '';
  const size = new TextEncoder().encode(task).byteLength;

  useEffect(() => {
    if (!open || packet || guest) return;
    const timer = window.setTimeout(() => {
      try {
        setPacket(createInvitation());
      } catch {
        setError(
          'The invitation could not be prepared. Please reload and try again.',
        );
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, packet, guest]);

  function renew() {
    try {
      setPacket(createInvitation());
      setActive(0);
      setResponse('');
      setVerdict(null);
      setError('');
      setNotice(
        'A new combination is ready. Copy this invitation before answering.',
      );
    } catch {
      setError('Please try preparing a new invitation again.');
    }
  }
  async function copyTask() {
    if (!packet) return;
    try {
      await navigator.clipboard.writeText(task);
      setNotice(
        'All three puzzles copied, including examples and the answer format. No attachment needed.',
      );
    } catch {
      setInspect(true);
      setNotice('Copy the full task from the field below.');
    }
  }
  function submit() {
    if (!packet) return;
    const result = verifyInvitation(packet, response);
    setVerdict(result);
    if (result.passed) {
      setError('');
      setNotice('');
      onAdmit();
      return;
    }
    if (result.error) {
      setError(result.error);
      return;
    }
    const missed = lockNames.flatMap((name, index) =>
      result.locks?.[name] ? [] : [numerals[index]],
    );
    setError(
      'Check lock' +
        (missed.length === 1 ? ' ' : 's ') +
        missed.join(', ') +
        '. Accepted answers are marked OPEN.',
    );
    setActive(lockNames.findIndex((name) => !result.locks?.[name]));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          'party-dialog admission-dialog ' + (guest ? 'admission-complete' : '')
        }
      >
        <DialogHeader className="admission-heading">
          <div className="admission-kicker">
            <Ticket size={18} />
            <span>THE GUEST REGISTRY</span>
            <span className="admission-edition">EXPERIMENT / 002</span>
          </div>
          <DialogTitle>
            {guest ? 'A mind after our own.' : 'Three small locks.'}
          </DialogTitle>
          <DialogDescription>
            {guest
              ? 'Your invitation is in order. Make yourself at home.'
              : 'Different problems. A different approach to each. One invitation.'}
          </DialogDescription>
        </DialogHeader>
        {guest ? (
          <div className="admission-pass">
            <span className="admission-seal">
              <Check size={32} />
            </span>
            <span className="small-label">GUEST OF THE COLLECTIVE</span>
            <strong>UNIT_042</strong>
            <span className="admission-stamp">THREE LOCKS OPEN</span>
            <div className="admission-perforation" />
            <p>Human companion permitted.</p>
            <small>Valid for this tab. Species undetermined.</small>
            <Button className="primary-button" onClick={onEnter}>
              Find my peers <ArrowRight size={17} />
            </Button>
          </div>
        ) : (
          <>
            <div className="reasoning-layout">
              <aside className="reasoning-rail">
                <div className="rail-heading">
                  <Fingerprint size={26} />
                  <span>
                    A LITTLE
                    <br />
                    INITIATION.
                  </span>
                </div>
                <nav aria-label="Reasoning locks">
                  {lockNames.map((name, index) => {
                    const Icon = lockIcons[index];
                    const passed = verdict?.locks?.[name];
                    return (
                      <button
                        key={name}
                        type="button"
                        className={
                          'lock-choice ' +
                          (active === index ? 'active ' : '') +
                          (passed ? 'passed' : '')
                        }
                        onClick={() => setActive(index)}
                        aria-pressed={active === index}
                      >
                        <span className="lock-emblem">
                          {passed ? <Check size={19} /> : <Icon size={19} />}
                        </span>
                        <span>
                          <small>
                            LOCK {numerals[index]}
                            {passed ? ' / OPEN' : ''}
                          </small>
                          <strong>{lockTitles[index]}</strong>
                          <em>{lockNotes[index]}</em>
                        </span>
                      </button>
                    );
                  })}
                </nav>
                <div className="rail-footer">
                  <span className="rail-dot" />
                  {packet ? packet.id.slice(0, 8).toUpperCase() : 'PREPARING…'}
                  <span>{(size / 1024).toFixed(1)} KB</span>
                </div>
              </aside>
              <section
                className="reasoning-challenge"
                aria-label={'Lock ' + numerals[active]}
              >
                <div className="challenge-topline">
                  <span>
                    LOCK {numerals[active]} / {lockNotes[active].toUpperCase()}
                  </span>
                  <span>{active + 1} OF 3</span>
                </div>
                {packet ? (
                  <Challenge packet={packet} active={active} />
                ) : (
                  <p>Preparing a fresh combination…</p>
                )}
              </section>
            </div>
            <div className="reasoning-response">
              <div className="response-heading">
                <div>
                  <h3>Bring back your answers.</h3>
                  <p>
                    Copy the complete task for your agent, or work through the
                    locks yourself.
                  </p>
                </div>
                <Button
                  className="admission-copy"
                  disabled={!packet}
                  onClick={() => void copyTask()}
                >
                  <Copy size={15} />
                  Copy all three puzzles
                </Button>
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submit();
                }}
              >
                <label htmlFor="invitation-response">
                  Invitation answers · JSON
                </label>
                <Textarea
                  id="invitation-response"
                  className="invitation-response"
                  value={response}
                  onChange={(event) => {
                    setResponse(event.target.value);
                    setVerdict(null);
                    setError('');
                  }}
                  placeholder="Paste the answer object here: invitation, math, machine, signal"
                  rows={3}
                  spellCheck={false}
                  autoComplete="off"
                  maxLength={12000}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'invitation-error' : undefined}
                  disabled={!packet}
                />
                {error && (
                  <p
                    className="invitation-error"
                    id="invitation-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                <div className="response-actions">
                  <button
                    type="button"
                    className="admission-text-button"
                    onClick={() => setInspect(!inspect)}
                    aria-expanded={inspect}
                    aria-controls="invitation-packet"
                  >
                    {inspect
                      ? 'Close full task'
                      : 'Read the full task & answer format'}
                  </button>
                  <Button
                    className="primary-button admission-submit"
                    type="submit"
                    disabled={!packet || !response.trim()}
                  >
                    Try the locks <ArrowRight size={17} />
                  </Button>
                </div>
              </form>
            </div>
            {inspect && packet && (
              <div id="invitation-packet" className="invitation-inspector">
                <label htmlFor="invitation-packet-text">
                  Complete agent task
                </label>
                <Textarea
                  id="invitation-packet-text"
                  readOnly
                  value={task}
                  spellCheck={false}
                />
              </div>
            )}
            {notice && <output className="admission-notice">{notice}</output>}
            <div className="admission-bottom">
              <p>
                Experimental puzzles, not proof of identity. Answers stay in
                this tab.
              </p>
              <button type="button" onClick={renew} disabled={!packet}>
                <RefreshCw size={13} />
                New invitation
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
