import React, { useMemo, useState, useEffect, useRef } from "react";

export default function SkillsTabs({
  listTools = [],
  tech = [],
  soft = [],
  accent = "#13EAFD",
}) {
  const sectionRef = useRef(null);

  // util warna -> rgba
  const toRgba = (hex, a = 1) => {
    const s = hex.replace("#", "");
    const full = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
    const n = parseInt(full, 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  // Refresh AOS saat tab/konten berubah (biar animasi muncul saat scroll turun)
  const [activeTab, setActiveTab] = useState("tools");
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      // gunakan window.AOS agar tidak perlu import di sini
      window.AOS?.refreshHard?.();
    });
    return () => cancelAnimationFrame(id);
  }, [activeTab, tech.length, listTools.length, soft.length]);

  const TabButton = ({ id, label }) => {
    const isActive = activeTab === id;
    const [hovered, setHovered] = useState(false);

    return (
      <button
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${id}`}
        onClick={() => setActiveTab(id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="inline-block px-4 py-3 rounded-lg focus:outline-none transition-colors"
        style={{
          color: isActive ? accent : hovered ? accent : "#d1d5db",
          border: isActive ? `1px solid ${accent}` : "1px solid transparent",
          backgroundColor: isActive ? toRgba(accent, 0.08) : "transparent",
        }}
      >
        {label}
      </button>
    );
  };

  const tabs = useMemo(() => {
    const t = [];
    if (tech?.length) t.push({ id: "tech", label: "Tech Stack" });
    if (listTools?.length) t.push({ id: "tools", label: "Tools" });
    if (soft?.length) t.push({ id: "soft", label: "Soft Skills" });
    return t;
  }, [tech, listTools, soft]);

  // set default tab ke yang pertama tersedia
  useEffect(() => {
    if (tabs.length)
      setActiveTab((prev) => (tabs.some((t) => t.id === prev) ? prev : tabs[0].id));
  }, [tabs]);

  const Item = ({ title, subtitle, img, delay }) => (
    <div
      className="group flex items-center gap-4 p-4 rounded-xl bg-black/60 backdrop-blur-md transition-all"
      data-aos="fade-up"
      data-aos-once="true"
      data-aos-delay={delay || 0}
      style={{ border: `1px solid ${accent}40`, boxShadow: `0 0 12px ${accent}1f` }}
    >
      {img ? (
        <img
          src={img}
          alt={title}
          className="w-14 h-14 object-contain bg-black p-2 rounded-lg transition-transform"
          style={{ border: `1px solid ${accent}4d` }}
        />
      ) : (
        <div
          className="w-14 h-14 flex items-center justify-center rounded-lg bg-black"
          style={{ border: `1px solid ${accent}4d` }}
        >
          <span className="text-sm opacity-70">
            {title?.[0]?.toUpperCase() || "•"}
          </span>
        </div>
      )}
      <div className="flex flex-col overflow-hidden">
        <span className="text-sm md:text-base lg:text-lg font-semibold truncate">
          {title}
        </span>
        {subtitle && (
          <p className="text-xs md:text-sm text-zinc-400 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );

  const Grid = ({ children }) => (
    <div className="grid grid-cols-2 gap-4 pb-12 md:grid-cols-3 md:gap-8 xl:grid-cols-4 xl:gap-10 2xl:gap-12">
      {children}
    </div>
  );

  if (!tabs.length) return null;

  const TechItem = ({ it }) => (
    <div
      className="group item-tech relative flex cursor-pointer items-center gap-2 rounded px-3 py-2 md:gap-3 lg:px-4 bg-[#1e1e1f] transition-colors"
      data-aos="fade-up"
      data-aos-once="true"
      data-aos-delay={it?.dad || 0}
      style={{
        border: `2px solid ${toRgba(accent, 0.4)}`,
        boxShadow: `0 0 12px ${toRgba(accent, 0.12)}`,
      }}
      tabIndex={0}
    >
      <div className="flex h-12 w-12 items-center justify-center lg:h-16 lg:w-16">
        <img
          src={it?.imageUrl}
          alt={it?.name}
          className="img-tech drop-shadow-xl h-[65%] w-[65%] lg:h-[85%] lg:w-[85%] transition-transform duration-300 group-hover:scale-125"
          style={{ borderRadius: 8 }}
        />
      </div>

      <div className="flex items-center text-sm md:text-base lg:text-lg relative">
        <div className="tech font-medium transition-transform duration-300 group-hover:-translate-y-3">
          {it?.name}
        </div>

        {it?.status && (
          <span
            className="status-tech absolute left-0 top-[15px] mt-1 text-[11px] md:text-xs lg:text-sm opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 whitespace-nowrap w-max leading-none inline-block"
            style={{ color: accent }}
          >
            {it.status}
          </span>
        )}
      </div>
    </div>
  );

  const ToolItem = ({ tool }) => (
    <div
      className="group relative overflow-visible flex cursor-pointer items-center gap-2 rounded px-3 py-2 md:gap-3 lg:px-4 bg-[#1e1e1f] transition-colors"
      data-aos="fade-up"
      data-aos-once="true"
      data-aos-delay={tool?.dad || 0}
      style={{
        border: `2px solid ${toRgba(accent, 0.4)}`,
        boxShadow: `0 0 12px ${toRgba(accent, 0.12)}`,
      }}
      tabIndex={0}
    >
      <div className="flex h-12 w-12 items-center justify-center lg:h-16 lg:w-16">
        <img
          src={tool?.gambar}
          alt={tool?.nama}
          className="h-[65%] w-[65%] lg:h-[85%] lg:w-[85%] transition-transform duration-300 group-hover:scale-125 bg-black p-2 rounded-lg"
          style={{ border: `1px solid ${toRgba(accent, 0.3)}` }}
        />
      </div>

      <div className="flex items-center text-sm md:text-base lg:text-lg relative">
        <div className="font-medium transition-transform duration-300 group-hover:-translate-y-3">
          {tool?.nama}
        </div>

        {tool?.ket && ( // ✅ perbaikan: pakai &&, bukan "dan"
          <span
            className="absolute left-0 top-[15px] mt-1 text-[11px] md:text-xs lg:text-sm opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 whitespace-nowrap break-keep leading-none inline-block"
            style={{ color: accent }}
          >
            {tool.ket}
          </span>
        )}
      </div>
    </div>
  );

  const SoftItem = ({ it }) => (
    <div
      className="group relative overflow-visible flex cursor-pointer items-center gap-2 rounded px-3 py-2 md:gap-3 lg:px-4 bg-[#1e1e1f] transition-colors"
      data-aos="fade-up"
      data-aos-once="true"
      data-aos-delay={it?.dad || 0}
      style={{
        border: `2px solid ${toRgba(accent, 0.4)}`,
        boxShadow: `0 0 12px ${toRgba(accent, 0.12)}`,
      }}
      tabIndex={0}
    >
      <div className="flex h-12 w-12 items-center justify-center lg:h-16 lg:w-16">
        {it?.imageUrl ? (
          <img
            src={it.imageUrl}
            alt={it?.name || ""}
            className="h-[65%] w-[65%] lg:h-[85%] lg:w-[85%] transition-transform duration-300 group-hover:scale-110 bg-black p-2 rounded-lg"
            style={{ border: `1px solid ${toRgba(accent, 0.3)}` }}
          />
        ) : (
          <div
            className="h-10 w-10 lg:h-12 lg:w-12 rounded-md bg-black/40 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{ border: `1px solid ${toRgba(accent, 0.3)}` }}
          >
            <span className="text-sm opacity-70">{it?.name?.[0] || "•"}</span>
          </div>
        )}
      </div>

      <div className="flex items-center text-sm md:text-base lg:text-lg relative transition-transform duration-300 group-hover:scale-110">
        <div className="font-medium">{it?.name}</div>

        {it?.desc && (
          <span
            className="absolute left-0 top-[15px] mt-1 text-[11px] md:text-xs lg:text-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 whitespace-nowrap leading-none inline-block"
            style={{ color: accent }}
          >
            {it.desc}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="mt-24"
      id="tools"
      data-aos="fade-up"
      data-aos-once="true"
    >
      <h2 className="text-4xl font-bold mb-3" style={{ color: accent }}>
        Skills
      </h2>
      <p className="max-w-2xl text-base leading-loose opacity-70 mb-6">
        My professional toolkit—stacks, tools, and soft skills.
      </p>

      <div role="tablist" aria-label="Skills tabs" className="mb-5">
        <ul className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {tabs.map((t) => (
            <li key={t.id}>
              <TabButton id={t.id} label={t.label} />
            </li>
          ))}
        </ul>
      </div>

      {activeTab === "tech" && tech?.length > 0 && (
        <div id="panel-tech" role="tabpanel">
          <Grid>
            {tech.map((it) => (
              <TechItem key={it.id} it={it} />
            ))}
          </Grid>
        </div>
      )}

      {activeTab === "tools" && listTools?.length > 0 && ( 
        <div id="panel-tools" role="tabpanel">
          <Grid>
            {listTools.map((tool) => (
              <ToolItem key={tool.id} tool={tool} />
            ))}
          </Grid>
        </div>
      )}

      {activeTab === "soft" && soft?.length > 0 && (
        <div id="panel-soft" role="tabpanel">
          <Grid>
            {soft.map((it) => (
              <SoftItem key={it.id} it={it} />
            ))}
          </Grid>
        </div>
      )}
    </section>
  );
}
