import React, { useEffect, useRef, useCallback, useMemo } from "react";
import './ProfileCard.css'

const ACCENT_DEFAULT = "#13EAFD";

const DEFAULT_BEHIND_GRADIENT =
  `radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),
      color-mix(in oklab, var(--accent) 40%, white 30%) calc(var(--card-opacity)*8%),
      color-mix(in oklab, var(--accent) 25%, black 30%) 40%,
      transparent 65%),
    radial-gradient(40% 60% at 60% 25%, color-mix(in oklab, var(--accent) 55%, black 50%) 0%, transparent 100%),
    conic-gradient(from 210deg at 50% 50%,
      color-mix(in oklab, var(--accent) 65%, black 30%) 0 20%,
      color-mix(in oklab, var(--accent) 35%, black 60%) 20% 40%,
      color-mix(in oklab, var(--accent) 45%, black 45%) 40% 60%,
      color-mix(in oklab, var(--accent) 28%, black 70%) 60% 80%,
      color-mix(in oklab, var(--accent) 55%, black 35%) 80% 100%)`;

const DEFAULT_INNER_GRADIENT =
  `linear-gradient(155deg,
     color-mix(in oklab, var(--accent) 24%, black 78%) 0%,
     rgba(5,10,12,.9) 100%)`;

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 650,
  INITIAL_DURATION: 1300,
  INITIAL_X_OFFSET: 64,
  INITIAL_Y_OFFSET: 56,
  DEVICE_BETA_OFFSET: 20,
};

const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v, p = 3) => parseFloat(v.toFixed(p));
const adjust = (v, a, b, c, d) => round(c + ((d - c) * (v - a)) / (b - a));
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const ProfileCardComponent = ({
  // visuals
  avatarUrl = "<Placeholder for avatar URL>",
  iconUrl = "",  
  grainUrl = "",   
  behindGradient,
  innerGradient,
  showBehindGradient = true,
  className = "",
  // motion
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  // content
  miniAvatarUrl,
  name = "Oktavianus",
  title = "Software Engineer",
  handle = "okta.codes",
  status = "Online",
  contactText = "Contact",
  showUserInfo = true,
  onContactClick,
  accentColor = ACCENT_DEFAULT,
}) => {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);

  // --- Motion handlers memoized
  const animationHandlers = useMemo(() => {
    if (!enableTilt) return null;
    let rafId = null;

    const updateCardTransform = (offsetX, offsetY, card, wrap) => {
      const width = card.clientWidth;
      const height = card.clientHeight;
      const percentX = clamp((100 / width) * offsetX);
      const percentY = clamp((100 / height) * offsetY);
      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${round(-(centerX / 5))}deg`,
        "--rotate-y": `${round(centerY / 4)}deg`,
      };
      Object.entries(properties).forEach(([prop, val]) => wrap.style.setProperty(prop, val));
    };

    const createSmoothAnimation = (duration, startX, startY, card, wrap) => {
      const startTime = performance.now();
      const targetX = wrap.clientWidth / 2;
      const targetY = wrap.clientHeight / 2;

      const loop = (t) => {
        const elapsed = t - startTime;
        const progress = clamp(elapsed / duration);
        const eased = easeInOutCubic(progress);
        const x = adjust(eased, 0, 1, startX, targetX);
        const y = adjust(eased, 0, 1, startY, targetY);
        updateCardTransform(x, y, card, wrap);
        if (progress < 1) rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    };

    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      },
    };
  }, [enableTilt]);

  // --- Pointer listeners
  const handlePointerMove = useCallback((e) => {
    const card = cardRef.current;
    const wrap = wrapRef.current;
    if (!card || !wrap || !animationHandlers) return;
    const rect = card.getBoundingClientRect();
    animationHandlers.updateCardTransform(e.clientX - rect.left, e.clientY - rect.top, card, wrap);
  }, [animationHandlers]);

  const handlePointerEnter = useCallback(() => {
    const card = cardRef.current;
    const wrap = wrapRef.current;
    if (!card || !wrap || !animationHandlers) return;
    animationHandlers.cancelAnimation();
    wrap.classList.add("pc-active");
    card.classList.add("pc-active");
  }, [animationHandlers]);

  const handlePointerLeave = useCallback((e) => {
    const card = cardRef.current;
    const wrap = wrapRef.current;
    if (!card || !wrap || !animationHandlers) return;
    animationHandlers.createSmoothAnimation(
      ANIMATION_CONFIG.SMOOTH_DURATION,
      e.offsetX,
      e.offsetY,
      card,
      wrap
    );
    wrap.classList.remove("pc-active");
    card.classList.remove("pc-active");
  }, [animationHandlers]);

  // --- Device orientation (opt-in, HTTPS)
  const handleDeviceOrientation = useCallback((event) => {
    const card = cardRef.current;
    const wrap = wrapRef.current;
    if (!card || !wrap || !animationHandlers) return;
    const { beta, gamma } = event || {};
    if (typeof beta !== "number" || typeof gamma !== "number") return;

    animationHandlers.updateCardTransform(
      card.clientHeight / 2 + gamma * mobileTiltSensitivity,
      card.clientWidth / 2 + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
      card,
      wrap
    );
  }, [animationHandlers, mobileTiltSensitivity]);

  // --- Lifecycle
  useEffect(() => {
    if (wrapRef.current) {
      wrapRef.current.style.setProperty("--accent", accentColor || ACCENT_DEFAULT);
    }
  }, [accentColor]);

  useEffect(() => {
    if (!enableTilt || !animationHandlers) return;
    const card = cardRef.current;
    const wrap = wrapRef.current;
    if (!card || !wrap) return;

    const pointerMoveHandler = handlePointerMove;
    const pointerEnterHandler = handlePointerEnter;
    const pointerLeaveHandler = handlePointerLeave;

    const clickEnableDevice = () => {
      if (!enableMobileTilt || typeof window === "undefined") return;
      const perm = window.DeviceMotionEvent && window.DeviceMotionEvent.requestPermission;
      if (location.protocol === "https:" && typeof perm === "function") {
        perm()
          .then((state) => {
            if (state === "granted") window.addEventListener("deviceorientation", handleDeviceOrientation);
          })
          .catch(console.error);
      } else {
        window.addEventListener("deviceorientation", handleDeviceOrientation);
      }
    };

    card.addEventListener("pointerenter", pointerEnterHandler);
    card.addEventListener("pointermove", pointerMoveHandler);
    card.addEventListener("pointerleave", pointerLeaveHandler);
    card.addEventListener("click", clickEnableDevice);

    // initial center glide
    const initX = wrap.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
    animationHandlers.updateCardTransform(initX, initY, card, wrap);
    animationHandlers.createSmoothAnimation(ANIMATION_CONFIG.INITIAL_DURATION, initX, initY, card, wrap);

    return () => {
      card.removeEventListener("pointerenter", pointerEnterHandler);
      card.removeEventListener("pointermove", pointerMoveHandler);
      card.removeEventListener("pointerleave", pointerLeaveHandler);
      card.removeEventListener("click", clickEnableDevice);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
      animationHandlers.cancelAnimation();
    };
  }, [
    enableTilt,
    enableMobileTilt,
    animationHandlers,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
    handleDeviceOrientation,
  ]);

  // --- Dynamic style tokens
  const cardStyle = useMemo(() => ({
    "--icon": iconUrl ? `url(${iconUrl})` : "none",
    "--grain": grainUrl ? `url(${grainUrl})` : "none",
    "--behind-gradient": showBehindGradient ? (behindGradient ?? DEFAULT_BEHIND_GRADIENT) : "none",
    "--inner-gradient": innerGradient ?? DEFAULT_INNER_GRADIENT,
  }), [iconUrl, grainUrl, showBehindGradient, behindGradient, innerGradient]);

  const handleContact = useCallback(() => onContactClick?.(), [onContactClick]);

  return (
    <div ref={wrapRef} className={`pc-card-wrapper ${className || ""}`.trim()} style={cardStyle}>
      <section ref={cardRef} className="pc-card" aria-label={`${name || "User"} profile card`}>

        {/* shimmering border ring */}
        <span className="pc-ring" aria-hidden />

        <div className="pc-inside">
          <div className="pc-shine" />
          <div className="pc-glare" />
          <div className="pc-content pc-avatar-content">
            <img
              className="avatar"
              src={avatarUrl}
              alt={`${name || "User"} avatar`}
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            {showUserInfo && (
              <div className="pc-user-info" role="group" aria-label="User quick info">
                <div className="pc-user-details">
                  <div className="pc-mini-avatar">
                    <img
                      src={miniAvatarUrl || avatarUrl}
                      alt={`${name || "User"} mini avatar`}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = avatarUrl; e.currentTarget.style.opacity = "0.6"; }}
                    />
                  </div>
                  <div className="pc-user-text">
                    <div className="pc-handle">@{handle}</div>
                    <div className="pc-status">{status}</div>
                  </div>
                </div>
                <button
                  className="pc-contact-btn"
                  onClick={handleContact}
                  type="button"
                  aria-label={`Contact ${name || "user"}`}
                >
                  {contactText}
                </button>
              </div>
            )}
          </div>

          <div className="pc-content">
            <div className="pc-details">
              <h3 title={name}>{name}</h3>
              <p>{title}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;
