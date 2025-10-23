import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import "./ChromaGrid.css";

export const ChromaGrid = ({
  items,
  onItemClick,
  className = "",
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
  // NEW: AOS props
  itemAos = "fade-up",
  itemAosBaseDelay = 60,
  itemAosDelayStep = 60,
  itemAosDuration = 650,
  itemAosOnce = false,
}) => {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  const data = Array.isArray(items) ? items : [];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px");
    setY.current = gsap.quickSetter(el, "--y", "px");
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  // NEW: refresh AOS saat data berubah
  useEffect(() => {
    const t = setTimeout(() => window.AOS?.refresh?.(), 0);
    return () => clearTimeout(t);
  }, [data.length]);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x, y, duration: damping, ease,
      onUpdate: () => { setX.current?.(pos.current.x); setY.current?.(pos.current.y); },
      overwrite: true,
    });
  };

  const handleMove = (e) => {
    const r = rootRef.current.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, { opacity: 1, duration: fadeOut, overwrite: true });
  };

  const handleCardMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={{ "--r": `${radius}px`, "--cols": columns, "--rows": rows }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {data.map((c, i) => {
        const delay = Number.isFinite(+c?.dad)
          ? +c.dad
          : itemAosBaseDelay + i * itemAosDelayStep;

        return (
          <article
            key={c.id ?? i}
            className="chroma-card"
            onMouseMove={handleCardMove}
            onClick={() => onItemClick?.(c)}
            style={{
              "--card-border": c.borderColor || "transparent",
              "--card-gradient": c.gradient,
              cursor: "pointer",
            }}
            // AOS attrs
            data-aos={itemAos}
            data-aos-delay={delay}
            data-aos-duration={itemAosDuration}
            data-aos-once={itemAosOnce}
          >
            <div className="chroma-img-wrapper">
              <img src={c.image} alt={c.title} loading="lazy" />
            </div>
            <footer className="chroma-info">
              <h3 className="name">{c.title}</h3>
              {c.handle && <span className="handle">{c.handle}</span>}
              <p className="role">{c.subtitle}</p>
              {c.location && <span className="location">{c.location}</span>}
            </footer>
          </article>
        );
      })}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
};

export default ChromaGrid;
