import { useState, useMemo, useEffect, useRef } from "react";
import ChromaGrid from "../ChromaGrid/ChromaGrid";
import AOS from "aos";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function ProjectSection({
  listProyek = [],
  onProjectClick,             
  useInternalModal = true,        
  categories = [
    "Web & Application Development",
    "System Analyst",
    "UI/UX Design",
    "Database Management",
  ],
}) {
  const accentHex = "#13EAFD";
  const accentRgb = "19,234,253";

  // ==== DEDUPE ====
  const uniqKeyOf = (it) => {
    const k =
      it?.id ??
      it?._id ??
      it?.slug ??
      it?.uid ??
      it?.key ??
      it?.title ??
      it?.name ??
      it?.nama ??
      it?.url ??
      it?.link ??
      `${it?.imageUrl || it?.thumbnail || ""}|${it?.href || ""}|${it?.kategori || it?.category || ""}`;
    return String(k).trim().toLowerCase();
  };
  const dedupe = (arr) => {
    const seen = new Set();
    return arr.filter((it) => {
      const k = uniqKeyOf(it);
      if (!k) return true;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  // ==== kategori ====
  const normalizeCats = (v) =>
    Array.isArray(v) ? v.filter(Boolean) : typeof v === "string" ? [v] : [];
  const getCats = (it) =>
    normalizeCats(it?.categories ?? it?.category ?? it?.kategori ?? it?.type ?? []);

  const detected = useMemo(
    () => Array.from(new Set(listProyek.flatMap(getCats))).filter(Boolean),
    [listProyek]
  );
  const allCategories = useMemo(() => {
    const base = Array.from(new Set([...(categories || []), ...detected]));
    return ["All", ...base.filter((c) => c && c !== "All")];
  }, [categories, detected]);

  // ==== filter state ====
  const [selectedCat, setSelectedCat] = useState("All");
  const [showAll, setShowAll] = useState(false);
  useEffect(() => setShowAll(false), [selectedCat]);

  const filteredRaw = useMemo(() => {
    if (selectedCat === "All") return listProyek;
    return listProyek.filter((it) => getCats(it).includes(selectedCat));
  }, [listProyek, selectedCat]);
  const filtered = useMemo(() => dedupe(filteredRaw), [filteredRaw]);

  const hasMore = filtered.length > 6;
  const visibleItems = useMemo(
    () => (showAll ? filtered : filtered.slice(0, 6)),
    [showAll, filtered]
  );

  const [fast, setFast] = useState(false);
  useEffect(() => {
    setFast(true);
    const to = setTimeout(() => setFast(false), 320); // ~0.3s mode cepat
    return () => clearTimeout(to);
  }, [selectedCat]);

  // ==== AOS refresh ====
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (AOS?.refreshHard) AOS.refreshHard();
      else window.AOS?.refreshHard?.();
    });
    return () => cancelAnimationFrame(id);
  }, [selectedCat, showAll, visibleItems.length]);

    const extractLinks = (it) => {
    const val = (v) => (typeof v === "string" ? v.trim() : "");
    const isDemoUrl = (u) =>
      /vercel\.app|netlify\.app|onrender\.com|pages\.dev|render\.com|herokuapp\.com|firebaseapp\.com|supabase\.co/i.test(
        u
      );

    const demo    = val(it.demo);
    const url     = val(it.url);
    const link    = val(it.link);
    const repo    = val(it.repo);
    const github  = val(it.github);
    const figma   = val(it.figma);
    const docs    = val(it.docs);

    // deteksi DEMO
    let demoHref = "";
    if (demo) demoHref = demo;
    else if (url && isDemoUrl(url)) demoHref = url;
    else if (link && isDemoUrl(link)) demoHref = link;

    // deteksi GITHUB
    let githubHref = "";
    if (repo && /github\.com/i.test(repo)) githubHref = repo;
    else if (github && /github\.com/i.test(github)) githubHref = github;
    else if (url && /github\.com/i.test(url)) githubHref = url;
    else if (link && /github\.com/i.test(link)) githubHref = link;

    const out = [];
    if (demoHref) out.push({ type: "demo", href: demoHref });
    if (githubHref) out.push({ type: "github", href: githubHref });

    if (out.length === 0) {
      if (figma) out.push({ type: "figma", href: figma });
      else if (docs) out.push({ type: "docs", href: docs });
    }

    // dedupe by href
    const seen = new Set();
    return out.filter(({ href }) => (seen.has(href) ? false : (seen.add(href), true)));
  };


  const [activeProject, setActiveProject] = useState(null);
  const openProject  = (it) => setActiveProject(it);
  const closeProject = () => setActiveProject(null);

  useEffect(() => {
    if (!activeProject) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && closeProject();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [activeProject]);

  // ==== icons & labels ====
  const typeToLabel = {
    demo: "Live Demo",
    github: "GitHub",
    figma: "Figma",
    docs: "Docs",
    video: "Video",
    link: "Website",
  };
  const Icon = ({ type }) => {
    switch (type) {
      case "github":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.68c-2.77.6-3.36-1.19-3.36-1.19-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.61.07-.61 1 .07 1.53 1.02 1.53 1.02.89 1.52 2.34 1.08 2.91.83.09-.64.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.02-2.68-.1-.25-.44-1.28.1-2.66 0 0 .83-.27 2.72 1.02A9.5 9.5 0 0 1 12 6.8c.84 0 1.69.11 2.48.32 1.89-1.29 2.72-1.02 2.72-1.02.54 1.38.2 2.41.1 2.66.63.7 1.02 1.59 1.02 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.67.91.67 1.84v2.72c0 .26.18.58.69.48A10 10 0 0 0 12 2Z"/>
          </svg>
        );
      case "figma":
        return (
          <svg width="16" height="16" viewBox="0 0 256 384" aria-hidden="true">
            <path fill="currentColor" d="M128 128a64 64 0 1 1 64-64 64 64 0 0 1-64 64zM64 192a64 64 0 1 1 64-64H64zm0 0h64v64a64 64 0 1 1-64-64zm64 0h64a64 64 0 1 1-64 64zM128 0H64a64 64 0 0 0 0 128h64z"/>
          </svg>
        );
      case "docs":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0l6 6"/>
          </svg>
        );
      case "demo":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
        );
      case "video":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M17 10.5V7a2 2 0 0 0-2-2H5C3.9 5 3 5.9 3 7v10c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11z"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M10.59 13.41 9.17 12l4.24-4.24 1.41 1.41zM7 17h10v2H7z"/>
          </svg>
        );
    }
  };


  const CombinedAction = ({ links }) => {
    const priority = ["demo", "github", "figma", "docs"];
    const sorted = [...links]
      .filter((l) => priority.includes(l.type))
      .sort((a, b) => priority.indexOf(a.type) - priority.indexOf(b.type))
      .slice(0, 2); 

    const ref = useRef(null);
    const openLink = (href) => window.open(href, "_blank", "noopener,noreferrer");

    const primaryStyle = {
      background: `linear-gradient(180deg, rgba(${accentRgb},0.16), rgba(${accentRgb},0.10))`,
      border: `1px solid rgba(${accentRgb},0.35)`,
      boxShadow: `0 10px 24px -16px rgba(${accentRgb},.34), inset 0 -1px 0 rgba(255,255,255,.04)`,
    };
    const ghostStyle = {
      background: "rgba(255,255,255,0.04)",
      border: `1px solid rgba(${accentRgb},.28)`,
    };
    const btnCls = "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl";

    if (sorted.length === 0) {
      return <span className="text-sm opacity-60">No external links.</span>;
    }

    if (sorted.length === 1) {
      const only = sorted[0];
      return (
        <div ref={ref} className="inline-flex">
          <button
            onClick={() => openLink(only.href)}
            className={btnCls}
            style={primaryStyle}
            aria-label={`Open ${typeToLabel[only.type]}`}
          >
            <Icon type={only.type} />
            <span>{typeToLabel[only.type]}</span>
          </button>
        </div>
      );
    }

    const [first, second] = sorted;
    return (
      <div ref={ref} className="flex flex-wrap gap-2">
        <button
          onClick={() => openLink(first.href)}
          className={btnCls}
          style={primaryStyle}
          aria-label={`Open ${typeToLabel[first.type]}`}
        >
          <Icon type={first.type} />
          <span>{typeToLabel[first.type]}</span>
        </button>
        <button
          onClick={() => openLink(second.href)}
          className={btnCls}
          style={ghostStyle}
          aria-label={`Open ${typeToLabel[second.type]}`}
        >
          <Icon type={second.type} />
          <span>{typeToLabel[second.type]}</span>
        </button>
      </div>
    );
  };


  return (
    <section id="project" className="mt-24 relative">
      {/* soft glow bg */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-x-0 top-[-120px] h-72 blur-3xl opacity-60"
          style={{
            background: `radial-gradient(50% 60% at 50% 40%, rgba(${accentRgb},0.18) 0%, rgba(${accentRgb},0.06) 45%, transparent 70%)`,
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* ===== Header ===== */}
        <div className="flex flex-col items-center text-center gap-4">
          <h2
            className="text-4xl md:text-5xl font-bold leading-tight bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #dffbff 0%, #13EAFD 60%, #7af7ff 100%)",
            }}
            data-aos="fade-up"
            data-aos-delay="75"
          >
            Projects
          </h2>

          <p
            className="max-w-2xl text-base md:text-lg leading-relaxed opacity-80"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            Showcasing selected works that reflect my skills, taste, and problem-solving.
          </p>

          {/* FILTER PILLS */}
          <div
            className="mt-4 w-full overflow-x-auto no-scrollbar"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="flex items-center justify-center gap-2 min-w-max px-2">
              {allCategories.map((cat) => {
                const active = selectedCat === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`group relative inline-flex items-center rounded-full px-4 py-2 text-sm transition-colors ${
                      active ? "text-white" : "text-[#c7f9ff]"
                    } active:scale-[.99]`}
                    style={{
                      background: active
                        ? `linear-gradient(180deg, rgba(${accentRgb},0.16) 0%, rgba(${accentRgb},0.12) 65%, rgba(${accentRgb},0.10) 100%)`
                        : "rgba(9,14,16,.55)",
                      border: `1px solid rgba(${accentRgb}, ${active ? 0.35 : 0.22})`,
                      boxShadow: active
                        ? `0 10px 24px -16px rgba(${accentRgb},.34), inset 0 -1px 0 rgba(255,255,255,.04)`
                        : `0 0 12px rgba(${accentRgb},.07)`,
                      textShadow: active ? "0 1px 0 rgba(0,0,0,.25)" : "none",
                      backdropFilter: "saturate(105%) blur(2px)",
                    }}
                  >
                    <span className="relative z-10">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* status mini */}
          <div
            className="text-xs mt-2 px-2 py-1 rounded-full border text-[#b6f7ff]/80 bg-[#071418]/40"
            data-aos="fade-up"
            data-aos-delay="230"
            style={{ borderColor: "rgba(19,234,253,.2)" }}
          >
            {visibleItems.length} of {filtered.length} visible — {selectedCat}
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="mt-10 relative">
        <motion.div
          layout
          transition={
            fast
              ? { type: "tween", duration: 0.22 }
              : { type: "spring", stiffness: 240, damping: 26 }
          }
          className="relative rounded-[28px] border backdrop-blur-xl p-4 sm:p-6 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.02)] bg-[linear-gradient(180deg,rgba(12,12,14,.75),rgba(10,10,12,.55))]"
          style={{ borderColor: "rgba(19,234,253,.2)" }}
          data-aos="fade-up"
          data-aos-delay={fast ? "0" : "260"}
        >
          {filtered.length ? (
            <motion.div layout>
              <ChromaGrid
                key={`${selectedCat}-${showAll}-${visibleItems.length}`}
                items={visibleItems}
                onItemClick={(it) => {
                  if (useInternalModal) {
                    openProject(it);           // modal internal saja
                  } else {
                    onProjectClick?.(it);      // delegasi ke parent
                  }
                }}
                radius={500}
                damping={0.45}
                fadeOut={0.6}
                ease="power3.out"
                // ⬇️ saat fast mode: tanpa delay & durasi lebih singkat
                itemAos="fade-up"
                itemAosBaseDelay={fast ? 0 : 60}
                itemAosDelayStep={fast ? 0 : 60}
                itemAosDuration={fast ? 300 : 650}
                itemAosOnce={false}
              />
            </motion.div>
          ) : (
            <div className="py-12 text-center opacity-80">
              No projects in <span className="text-[#9af3ff]">{selectedCat}</span> yet.
              <button
                onClick={() => setSelectedCat("All")}
                className="ml-2 underline underline-offset-4 hover:opacity-90"
                style={{ color: accentHex }}
              >
                View all
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* View more */}
      {hasMore && (
        <motion.div
          layout
          transition={fast ? { type: "tween", duration: 0.22 } : { type: "spring", stiffness: 240, damping: 26 }}
          className="mt-10 flex justify-center"
        >
          <button
            onClick={() => setShowAll((v) => !v)}
            className="group relative inline-flex items-center gap-2 rounded-full px-7 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13EAFD]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-transform active:translate-y-[1px]"
            data-aos="fade-up"
            data-aos-delay={fast ? "0" : "320"}
            aria-label={showAll ? "View less" : "View more"}
            style={{
              background: showAll
                ? `linear-gradient(180deg, rgba(${accentRgb},0.14) 0%, rgba(${accentRgb},0.10) 55%, rgba(${accentRgb},0.06) 100%)`
                : "rgba(12,16,18,0.55)",
              border: `1px solid rgba(${accentRgb}, ${showAll ? 0.34 : 0.22})`,
              boxShadow: showAll
                ? `0 12px 26px -18px rgba(${accentRgb},.30), inset 0 -1px 0 rgba(255,255,255,.05)`
                : `0 10px 24px -20px rgba(0,0,0,.55)`,
              textShadow: "0 1px 0 rgba(0,0,0,.25)",
              transition:
                "background .28s ease, box-shadow .28s ease, border-color .28s ease, transform .18s ease, filter .28s ease",
              filter: "saturate(95%)",
              willChange: "transform, box-shadow, background",
              backdropFilter: "blur(2px)",
            }}
          >
            <span
              className="pointer-events-none absolute -inset-1 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: `linear-gradient(180deg, rgba(${accentRgb},0.10), rgba(${accentRgb},0.06))` }}
            />
            <span className="relative z-10 flex items-center gap-2">
              {showAll ? "View less" : `View more (${Math.max(filtered.length - 6, 0)})`}
              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90 transition-transform group-hover:translate-x-0.5">
                <path fill="currentColor" d={showAll ? "M17 13H7v-2h10v2z" : "M13 5l7 7-7 7v-4H4v-6h9V5z"} />
              </svg>
            </span>
            <span className="pointer-events-none absolute -inset-1 rounded-full blur-2xl bg-[#13EAFD]/30 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </motion.div>
      )}

      {/* ===== MODAL internal  ===== */}
      {useInternalModal && activeProject && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeProject} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative z-[61] w-full sm:max-w-[720px] mx-4 rounded-2xl overflow-hidden border shadow-[0_24px_60px_-30px_rgba(0,0,0,.8)]"
            style={{
              background: "linear-gradient(180deg, rgba(18,18,20,.9), rgba(10,10,12,.88))",
              borderColor: `rgba(${accentRgb},.25)`,
            }}
          >
            {/* HERO IMAGE BESAR */}
            <div className="relative w-full aspect-[16/9] bg-black/30">
              <img
                src={activeProject.image}
                alt={activeProject.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
              {/* Close button */}
              <button
                onClick={closeProject}
                className="absolute top-3 right-3 p-2 rounded-md bg-black/40 hover:bg-black/60 border"
                style={{ borderColor: `rgba(${accentRgb},.25)` }}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-5 sm:p-6">
              <h3 className="text-2xl font-semibold">{activeProject.title}</h3>
              {/* {activeProject.subtitle && (
                <p className="text-sm opacity-80 mt-1">{activeProject.subtitle}</p>
              )} */}

              {/* Deskripsi */}
              {activeProject.fullDescription && (
                <p className="text-sm opacity-80 mt-4 leading-relaxed">
                  {activeProject.fullDescription}
                </p>
              )}

              {/* Actions */}
              <div className="mt-5">
                {extractLinks(activeProject).length ? (
                  <CombinedAction links={extractLinks(activeProject)} />
                ) : (
                  <span className="text-sm opacity-60">No external links.</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
