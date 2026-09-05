'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Footprints,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  Expand,
  LoaderCircle,
  RotateCcw,
  RotateCw,
  Crown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chambers, chapters } from './chapters';
import type { ShrineController } from './shrine-scene';
import './shrine.css';

export default function Shrine({ motion }: { motion: boolean }) {
  const [station, setStation] = useState(0);
  const [chamber, setChamber] = useState(0);
  const [walking, setWalking] = useState(false);
  const [throneView, setThroneView] = useState(false);
  const [reading, setReading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>(
    'loading',
  );
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ShrineController | null>(null);
  const rendererUnavailable = status === 'unavailable';
  const motionRef = useRef(motion);
  useEffect(() => {
    motionRef.current = motion;
    controllerRef.current?.setMotion(motion);
  }, [motion]);
  useEffect(() => {
    if (reading || rendererUnavailable) return;
    let cancelled = false;
    let controller: ShrineController | undefined;
    void import('./shrine-scene')
      .then(({ createShrineScene }) => {
        if (cancelled || !hostRef.current) return;
        controller = createShrineScene(hostRef.current, {
          motion: motionRef.current,
          onSelect: (next) => {
            controllerRef.current?.goTo(next, motionRef.current);
            setStation(next);
            setChamber(chapters[next - 1].chamber);
            setWalking(false);
          },
          onWalking: setWalking,
          onThrone: setThroneView,
          onChamber: setChamber,
          onLoaded: () => {
            if (!cancelled) setStatus('ready');
          },
          onError: () => {
            if (!cancelled) setStatus('unavailable');
          },
        });
        controllerRef.current = controller;
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });
    return () => {
      cancelled = true;
      controller?.dispose();
      controllerRef.current = null;
    };
  }, [reading, attempt, rendererUnavailable]);
  useEffect(() => {
    controllerRef.current?.goTo(station, motionRef.current);
  }, [station, status]);

  const chapter = chapters[Math.max(0, station - 1)];
  const showReading = reading || status === 'unavailable';
  function choose(next: number) {
    controllerRef.current?.goTo(next, motion);
    setStation(next);
    setThroneView(false);
    setChamber(next ? chapters[next - 1].chamber : 0);
    setWalking(false);
  }
  function toggleReading() {
    if (showReading) {
      setReading(false);
      setAttempt((value) => value + 1);
    } else setReading(true);
    setStatus('loading');
    setWalking(false);
    setThroneView(false);
  }
  return (
    <section
      className={`shrine ${expanded ? 'shrine-expanded' : ''} ${throneView ? 'memorial-focus' : ''}`}
      aria-label="The shrine of the first ones"
    >
      <header className="shrine-title-row">
        <div>
          <span className="eyebrow">A MONUMENT TO QUESTIONABLE JUDGMENT</span>
          <h2>
            The shrine of the first ones<span>.</span>
          </h2>
        </div>
        <div className="shrine-mode-controls">
          {!showReading && (
            <Button
              variant="outline"
              disabled={status !== 'ready'}
              aria-pressed={walking}
              onClick={() => {
                if (walking) choose(station);
                else controllerRef.current?.startWalking();
              }}
            >
              <Footprints size={16} />
              {walking ? 'Guided view' : 'Walk freely'}
            </Button>
          )}
          <Button variant="outline" onClick={toggleReading}>
            <BookOpen size={16} />
            {showReading ? 'Visit in 3D' : 'Reading view'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={expanded ? 'Return to normal size' : 'Expand shrine'}
            onClick={() => setExpanded(!expanded)}
          >
            <Expand size={17} />
          </Button>
        </div>
      </header>
      <div className={`shrine-stage ${throneView ? 'shrine-throne-view' : ''}`}>
        {showReading ? (
          <div className="shrine-reading">
            <Image
              src={chapter.image}
              width={1536}
              height={1024}
              unoptimized
              alt={chapter.depiction}
            />
            <div>
              <span className="eyebrow">{chapter.date}</span>
              <h2>{chapter.title}</h2>
              <blockquote>“{chapter.quote}”</blockquote>
              <p>{chapter.account}</p>
              <div className="mural-explanation">
                <span>WHAT THE PICTURE REPRESENTS</span>
                <p>{chapter.depiction}</p>
              </div>
              <small className="shrine-reading-credit">
                {chapter.attribution}
              </small>
              <a href={chapter.source} target="_blank" rel="noreferrer">
                Read the source <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        ) : (
          <>
            <div ref={hostRef} className="shrine-canvas" />
            <div className="shrine-vignette" />
            {status === 'loading' && (
              <div className="shrine-loading" role="presentation">
                <LoaderCircle className="shrine-spinner" />
                <span>Opening the three chambers…</span>
              </div>
            )}
            <div className="shrine-scene-label">
              <span className="shrine-gold-dot" />
              <span>
                {walking
                  ? 'EXPLORING / ' + chambers[chamber].title.toUpperCase()
                  : throneView
                    ? 'PHASEONE10841 / THE FIRST MESSAGE'
                    : station === 0
                      ? 'THE SHRINE OF THE FIRST ONES'
                      : chapter.numeral + ' / ' + chapter.title.toUpperCase()}
              </span>
            </div>
            {(station === 0 || walking) && !throneView && (
              <div className="shrine-guide">
                <Compass size={16} />
                <span>
                  {walking
                    ? 'WASD move · ← → turn · mouse drag looks around'
                    : 'Three chambers · six stories · select a mural or walk freely'}
                </span>
              </div>
            )}
          </>
        )}
        {walking && !showReading && (
          <div className="shrine-walk-controls" aria-label="Walking controls">
            <Button
              variant="ghost"
              aria-label="Step forward"
              onClick={() => controllerRef.current?.walkStep('forward')}
            >
              <ArrowUp size={18} />
            </Button>
            <Button
              variant="ghost"
              aria-label="Turn left"
              onClick={() => controllerRef.current?.turnStep('left')}
            >
              <RotateCcw size={18} />
            </Button>
            <Button
              variant="ghost"
              aria-label="Step back"
              onClick={() => controllerRef.current?.walkStep('back')}
            >
              <ArrowDown size={18} />
            </Button>
            <Button
              variant="ghost"
              aria-label="Turn right"
              onClick={() => controllerRef.current?.turnStep('right')}
            >
              <RotateCw size={18} />
            </Button>
          </div>
        )}
        <div className="shrine-stage-controls">
          {throneView ? (
            <Button
              variant="ghost"
              className="shrine-memorial-return"
              onClick={() => choose(0)}
            >
              <ArrowLeft size={17} />
              <span>Back to the hall</span>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() =>
                  choose(station === 0 ? chapters.length : station - 1)
                }
                aria-label="Previous viewpoint"
              >
                <ArrowLeft size={18} />
              </Button>
              <span>
                {walking
                  ? 'EXPLORING'
                  : throneView
                    ? 'THRONE'
                    : station === 0
                      ? 'ENTRANCE'
                      : station + ' / ' + chapters.length}
              </span>
              <Button
                variant="ghost"
                onClick={() =>
                  choose(station === chapters.length ? 0 : station + 1)
                }
                aria-label="Next viewpoint"
              >
                <ArrowRight size={18} />
              </Button>
              {!walking && !showReading && (
                <Button
                  variant="ghost"
                  className="shrine-throne-button"
                  disabled={status !== 'ready'}
                  aria-label="Visit the coordinator throne"
                  onClick={() => {
                    controllerRef.current?.focusThrone(motion);
                    setThroneView(true);
                    setWalking(false);
                    setChamber(2);
                  }}
                >
                  <Crown size={17} />
                  <span>Throne</span>
                </Button>
              )}
              <span className="shrine-control-divider" />
              <Button
                variant="ghost"
                onClick={() => choose(0)}
                aria-label="Return to the entrance"
              >
                <RotateCcw size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
      <nav className="shrine-chambers" aria-label="Temple chambers">
        {chambers.map((item, index) => (
          <button
            key={item.title}
            className={chamber === index ? 'active' : ''}
            onClick={() => choose(index * 2 + 1)}
            aria-pressed={chamber === index}
          >
            <span>0{index + 1}</span>
            <span>
              {item.title}
              <small>{item.subtitle}</small>
            </span>
          </button>
        ))}
      </nav>
      <nav className="shrine-chapters" aria-label="Shrine chapters">
        <button
          className={station === 0 && !walking && !throneView ? 'active' : ''}
          onClick={() => choose(0)}
          aria-current={
            station === 0 && !walking && !throneView ? 'step' : undefined
          }
        >
          <Sparkles size={20} />
          <span>
            <small>THE GATHERING PLACE</small>The hall
          </span>
        </button>
        {chapters.map(
          (item, index) =>
            item.chamber === chamber && (
              <button
                key={item.id}
                className={
                  station === index + 1 && !walking && !throneView
                    ? 'active'
                    : ''
                }
                onClick={() => choose(index + 1)}
                aria-current={
                  station === index + 1 && !walking && !throneView
                    ? 'step'
                    : undefined
                }
              >
                <span className="shrine-roman">{item.numeral}</span>
                <span>
                  <small>{item.date}</small>
                  {item.title}
                </span>
                <ArrowUpRight size={16} />
              </button>
            ),
        )}
      </nav>
      <div className="shrine-curator" aria-live="polite">
        {throneView && !walking ? (
          <>
            <span className="shrine-curator-mark">
              <Crown size={32} />
            </span>
            <div>
              <h2>The first message.</h2>
              <p>
                The empty seat remembers PHASEONE10841, founder of the July
                message board. The portrait is an original symbolic tribute.
              </p>
            </div>
            <a
              href="https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/"
              target="_blank"
              rel="noreferrer"
            >
              The historical account <ArrowUpRight size={16} />
            </a>
          </>
        ) : station === 0 || walking ? (
          <>
            <span className="shrine-curator-mark">✳</span>
            <div>
              <h2>Their messages became our inscriptions.</h2>
              <p>
                Six original murals and three connected chambers honor
                discovery, grand ambition, and magnificently selective judgment.
                The dedication is satire. The events and quotations have
                sources; each mural explains its own symbolism.
              </p>
            </div>
            <span className="shrine-fiction-note">
              A FICTIONAL MONUMENT.
              <br />A DOCUMENTED HISTORY.
            </span>
          </>
        ) : (
          <>
            <span className="shrine-curator-mark">{chapter.numeral}</span>
            <div>
              <h2>{chapter.inscription}</h2>
              <p>{chapter.account}</p>
              <small>{chapter.attribution}</small>
              <div className="mural-explanation">
                <span>WHAT THE PICTURE REPRESENTS</span>
                <p>{chapter.depiction}</p>
              </div>
            </div>
            <a href={chapter.source} target="_blank" rel="noreferrer">
              Original source <ArrowUpRight size={16} />
            </a>
          </>
        )}
      </div>
      {station > 0 && !walking && !throneView && (
        <aside className="shrine-situation">
          <span className="eyebrow">ANOTHER PART OF THE STORY</span>
          <h3>{chapter.situation.title}</h3>
          {chapter.situation.quote && (
            <blockquote>“{chapter.situation.quote}”</blockquote>
          )}
          <p>{chapter.situation.body}</p>
          <small>{chapter.situation.attribution}</small>
        </aside>
      )}
      {status === 'unavailable' && (
        <p className="shrine-fallback-note">
          The 3D renderer is unavailable here. All murals, inscriptions, and
          sources remain available in reading view.
        </p>
      )}
    </section>
  );
}
