import { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';

const ModelViewer = lazy(() => import('./ModelViewer.jsx'));

const EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const SLIDE_DURATION = 780;
const AUTO_INTERVAL = 5000;
const RESUME_DELAY = 3500;

function mod(n, m) {
  return ((n % m) + m) % m;
}

export default function Carousel({ models }) {
  const [center, setCenter] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const slideTimer = useRef(null);
  const resumeTimer = useRef(null);
  const downPos = useRef({ x: 0, y: 0, had: false });
  const count = models.length;

  const goTo = useCallback((idx) => {
    if (idx === center || isSliding) return;
    const raw = idx - center;
    const wrapped = ((raw % count) + count) % count;
    const shortest = wrapped <= count / 2 ? wrapped : wrapped - count;
    if (shortest === 0) return;
    setIsSliding(true);
    setCenter(idx);
    slideTimer.current = setTimeout(() => setIsSliding(false), SLIDE_DURATION);
  }, [center, count, isSliding]);

  const handleInteractStart = useCallback(() => {
    setInteracting(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const handleInteractEnd = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setInteracting(false), RESUME_DELAY);
  }, []);

  useEffect(() => {
    if (interacting || isSliding || count <= 1) return;
    const id = setTimeout(() => {
      setCenter((c) => mod(c + 1, count));
      setIsSliding(true);
      slideTimer.current = setTimeout(() => setIsSliding(false), SLIDE_DURATION);
    }, AUTO_INTERVAL);
    return () => clearTimeout(id);
  }, [center, interacting, isSliding, count]);

  useEffect(() => {
    return () => {
      if (slideTimer.current) clearTimeout(slideTimer.current);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  if (count === 0) return null;

  const ordered = [];
  for (let i = -1; i <= 1; i++) {
    const idx = mod(center + i, count);
    ordered.push({ idx, offset: i });
  }

  return (
    <div className="carousel">
      <div className="carousel-track">
        {ordered.map(({ idx, offset }) => {
          const model = models[idx];
          const isCenter = offset === 0;
          return (
            <div
              key={model.id}
              className={`carousel-box ${isCenter ? 'is-center' : 'is-side'}`}
              data-offset={offset}
              style={{
                transform: `translate(-50%, -50%) translateX(calc(${offset} * (var(--box-w) + var(--gap)))) scale(${isCenter ? 1 : 0.82})`,
                transition: `transform ${SLIDE_DURATION}ms ${EASING}`,
                zIndex: isCenter ? 3 : 1,
              }}
              onPointerDown={(e) => {
                downPos.current = { x: e.clientX, y: e.clientY, had: true };
              }}
              onClick={(e) => {
                if (isCenter) return;
                const d = downPos.current;
                if (d.had) {
                  const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y);
                  if (moved > 8) { downPos.current.had = false; return; }
                }
                downPos.current.had = false;
                goTo(idx);
              }}
              role={isCenter ? undefined : 'button'}
              aria-label={isCenter ? undefined : `Focus ${model.display_name}`}
            >
              <Suspense fallback={
                <div className="viewer-loading">
                  <div className="loader-ring" />
                  <span>Preparing stage…</span>
                </div>
              }>
                <ModelViewer
                  url={model.url}
                  isActive={isCenter && !isSliding}
                  onInteractStart={handleInteractStart}
                  onInteractEnd={handleInteractEnd}
                />
              </Suspense>
            </div>
          );
        })}
      </div>

      <div className="carousel-captions">
        {ordered.map(({ idx, offset }) => {
          const model = models[idx];
          return (
            <div
              key={`cap-${model.id}`}
              className={`caption ${offset === 0 ? 'caption-center' : 'caption-side'}`}
              style={{
                transform: `translate(-50%, -50%) translateX(calc(${offset} * (var(--box-w) + var(--gap))))`,
                transition: `transform ${SLIDE_DURATION}ms ${EASING}, opacity 500ms ease`,
                opacity: offset === 0 ? 1 : 0.45,
                zIndex: offset === 0 ? 3 : 1,
              }}
            >
              <span className="caption-name">{model.display_name}</span>
              <span className="caption-sub">Model {mod(idx + 1, count) || count}</span>
            </div>
          );
        })}
      </div>

      <div className="carousel-indicator">
        {models.map((m, i) => (
          <button
            key={m.id}
            className={`indicator-dot ${i === center ? 'is-active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to ${m.display_name}`}
          >
            <span className="indicator-bar" />
          </button>
        ))}
      </div>
    </div>
  );
}
