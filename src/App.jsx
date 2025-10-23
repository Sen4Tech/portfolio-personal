import { useState, useEffect } from "react";
import ShinyText from "./components/ShinyText/ShinyText";
import BlurText from "./components/BlurText/BlurText";
import Lanyard from "./components/Lanyard/Lanyard";
import { listTools, listProyek, tech, soft } from "./data";
import SkillsTabs from "./components/Pages/SkillsTabs";
import ChromaGrid from "./components/ChromaGrid/ChromaGrid";
import ProjectModal from "./components/ProjectModal/ProjectModal";
import Aurora from "./components/Aurora/Aurora";
import AOS from "aos";
import ChatRoom from "./components/ChatRoom";
import "aos/dist/aos.css";
import Model from "./components/CarViewer/Model";
import Project from "./components/Pages/Project";

function App() {
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    AOS.init({ once: true, duration: 900, easing: "ease-out-cubic" });

    const nav = performance.getEntriesByType("navigation")[0];
    const isReload = nav && nav.type === "reload";
    if (isReload) {
      const baseUrl = window.location.origin + "/portofolio/";
      window.location.replace(baseUrl);
    }
  }, []);

  const handleCloseModal = () => setSelectedProject(null);

  return (
    <>
      {/* ===== Background Aurora ===== */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Aurora
          colorStops={["#13EAFD", "#1a1202", "#13EAFD"]}
          blend={0.45}
          amplitude={1.1}
          speed={0.55}
        />
      </div>

      {/* Container */}
      <main className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 text-gray-100">
        <section
          className="
            relative z-0 grid grid-cols-1 md:grid-cols-12
            items-center
            gap-y-10 md:gap-y-0 gap-x-16 xl:gap-x-24
            min-h-[80vh] py-10 md:py-12 
          "
        >
          {/* Left */}
          <div
            className="md:col-span-5 pr-6 md:pr-12 lg:pr-14"
            data-aos="fade-up"
          >
            {/* Quote badge */}
            <div className="relative mb-6 w-fit group">
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-[#13EAFD]/25">
                <img src="./assets/okta.png" className="w-10 h-10 object-cover rounded-md" />
                <q className="text-[#13EAFD] font-medium tracking-tight">Build. Inspire. Evolve.</q>
              </div>
              <span className="pointer-events-none absolute -inset-[6px] rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 bg-[#13EAFD]/15" />
              <span className="pointer-events-none absolute -inset-[1px] rounded-3xl bg-[conic-gradient(from_180deg_at_50%_50%,rgba(19,234,253,.25),transparent_30%_70%,rgba(19,234,253,.25))] opacity-50" />
            </div>

           {/* H1 */}
            <h1 className="whitespace-normal md:whitespace-nowrap text-[36px] sm:text-[46px] md:text-[56px] lg:text-[62px] font-bold leading-[1.1] mb-6 tracking-[-0.01em]">
              <ShinyText text="Hi, I'm Oktavianus" disabled={false} speed={2.4} />
            </h1>


            <BlurText
              text="Full-stack developer crafting elegant, high-performance web apps — where design meets precision."
              delay={120}
              animateBy="words"
              direction="top"
              className="text-lg text-gray-300 mb-6"
            />

            {/* CTA */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Primary — Download CV */}
              <a
                href="./assets/CV.pdf"
                download="Oktavianus_CV.pdf"
                aria-label="Download CV"
                className="group relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13EAFD]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-transform active:translate-y-[1px]"
              >
                <span className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#3DEBFA_0%,#13EAFD_60%,#0CCFE2_100%)] ring-1 ring-[#13EAFD]/50 shadow-[0_10px_28px_-10px_rgba(19,234,253,.55),inset_0_-2px_0_rgba(0,0,0,.16)] transition-all duration-200 group-hover:shadow-[0_16px_40px_-10px_rgba(19,234,253,.65),inset_0_-2px_0_rgba(0,0,0,.14)] group-hover:brightness-[1.03]" />
                <span className="pointer-events-none absolute inset-x-6 -bottom-3 h-6 rounded-full blur-xl bg-[#13EAFD]/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative z-10 flex items-center gap-2">
                  <ShinyText
                    text="Download CV"
                    disabled={false}
                    speed={2.4}
                    className="!text-white drop-shadow-[0_1px_0_rgba(0,0,0,.25)]"
                  />
                  <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90">
                    <path fill="currentColor" d="M12 3v10.17l3.59-3.58L17 11l-5 5-5-5 1.41-1.41L11 13.17V3h1zM5 19h14v2H5z" />
                  </svg>
                </span>
              </a>

              {/* Secondary — Explore Projects */}
              <a
                href="#project"
                aria-label="Explore Projects"
                className="group relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-[#13EAFD] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#13EAFD]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-[#13EAFD]/60 transition-colors group-hover:ring-[#13EAFD]" />
                <span className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(19,234,253,.14),rgba(19,234,253,.08))] opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="absolute -inset-1 rounded-full blur-lg bg-[#13EAFD]/18 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative z-10 flex items-center gap-2 text-[#13EAFD] group-hover:text-[#13EAFD] transition-colors">
                  <ShinyText text="Explore Projects" disabled={false} speed={2.4} className="!text-[#13EAFD]" />
                  <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90">
                    <path fill="currentColor" d="M13 5l7 7-7 7v-4H4v-6h9V5z" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          {/* Right */}
          <div
            className="relative md:col-span-7 pl-6 md:pl-12 lg:pl-16 z-[10] w-full"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <div className="relative w-full">
              <Model
                className="relative w-full h-[660px] lg:h-[700px] bg-transparent"
                modelUrl="https://threejs.org/examples/models/collada/stormtrooper/stormtrooper.dae"
                textureUrl="https://threejs.org/examples/models/collada/stormtrooper/Stormtrooper_D.jpg"
                modelScale={1.0}
                cameraFov={40}
                fitPadding={1}
                initialAzimuthDeg={-90}
                initialElevDeg={20}
                targetYOffsetRatio={-0.35}
                modelTiltDeg={0}
                showGrid={false}   
              />

            </div>
          </div>
        </section>

        {/* ===== ABOUT ===== */}
        <section
          id="about"
          className="mt-16 mx-auto w-full max-w-[1600px] rounded-3xl border-2 border-[#13EAFD]/30 shadow-[0_0_28px_rgba(243,203,80,0.14)] bg-gradient-to-br from-black/70 via-[#0f0f0f]/70 to-black/70 p-6 md:p-10"
          data-aos="fade-up"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="basis-full md:basis-7/12 md:pr-8 md:border-r border-[#13EAFD]/25">
              <h2 className="text-3xl md:text-4xl font-bold text-[#13EAFD] mb-5">About Me</h2>

              <BlurText
                text="I’m Oktavianus — I build modern, scalable applications with intuitive UX. I enjoy working with AI, modern front-end stacks, and cloud architectures — blending creativity with technical rigor to deliver meaningful products. 20+ shipped projects, 3+ years hands-on."
                delay={120}
                animateBy="words"
                direction="top"
                className="text-base md:text-lg leading-relaxed mb-10 text-gray-300"
              />

              <div className="flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left gap-y-8 sm:gap-y-0 mb-2 w-full">
                <div>
                  <h3 className="text-3xl md:text-4xl mb-1 text-[#13EAFD]">20+</h3>
                  <p className="text-gray-400">Projects Finished</p>
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl mb-1 text-[#13EAFD]">1+</h3>
                  <p className="text-gray-400">Years of Experience</p>
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl mb-1 text-[#13EAFD]">3.58 / 4.00</h3>
                  <p className="text-gray-400">GPA</p>
                </div>
              </div>

              <ShinyText
                text="Working Smart"
                disabled={false}
                speed={2.4}
                className="text-sm md:text-base text-[#13EAFD]"
              />
            </div>

            <div className="basis-full md:basis-5/12 md:pl-8 overflow-hidden max-w-full flex justify-center z-10">
              <Lanyard position={[0, 0, 15]} gravity={[0, -40, 0]} />
            </div>
          </div>
        </section>

        {/* ===== TOOLS ===== */}
        <SkillsTabs listTools={listTools} tech={tech} soft={soft} accent="#13EAFD" />

        {/* ===== PROJECTS ===== */}
        <Project listProyek={listProyek} onProjectClick={setSelectedProject} accent="#13EAFD" />
        {/* ===== CONTACT ===== */}
        <section className="mt-24" id="contact">
          <h2 className="text-4xl font-bold text-center mb-2 text-[#13EAFD]" data-aos="fade-up">
            Contact & Chat
          </h2>
          <p
            className="text-center text-base leading-loose mb-8 opacity-70"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Get in touch with me or chat in real-time.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div
              className="flex-1 bg-black/60 p-6 rounded-xl border border-[#13EAFD]/30 shadow-[0_0_20px_rgba(243,203,80,0.08)]"
              data-aos="fade-up"
            >
              <ChatRoom />
            </div>

            <div className="flex-1" data-aos="fade-up" data-aos-delay="150">
              <form
                action="https://formsubmit.co/rissoppa21@gmail.com"
                method="POST"
                className="bg-black/60 p-8 w-full rounded-xl border border-[#13EAFD]/30"
                autoComplete="off"
              >
                <div className="flex flex-col gap-6">
                  <label className="flex flex-col gap-2">
                    <span className="font-semibold">Full Name</span>
                    <input
                      type="text"
                      name="Name"
                      placeholder="Input Name..."
                      className="border border-[#13EAFD]/30 p-3 rounded-md bg-transparent focus:outline-none focus:border-[#13EAFD]/70"
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="font-semibold">Email</span>
                    <input
                      type="email"
                      name="Email"
                      placeholder="Input Email..."
                      className="border border-[#13EAFD]/30 p-3 rounded-md bg-transparent focus:outline-none focus:border-[#13EAFD]/70"
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="font-semibold">Message</span>
                    <textarea
                      name="message"
                      id="message"
                      rows="7"
                      placeholder="Message..."
                      className="border border-[#13EAFD]/30 p-3 rounded-md bg-transparent focus:outline-none focus:border-[#13EAFD]/70"
                      required
                    ></textarea>
                  </label>

                  <button
                    type="submit"
                    className="font-semibold bg-[#1a1a1a] p-4 px-6 rounded-full w-full cursor-pointer border border-[#13EAFD]/60 hover:bg-[#2a2a2a] transition-colors shadow-[0_0_10px_rgba(243,203,80,0.35)]"
                  >
                    <ShinyText text="Send" disabled={false} speed={2.4} className="custom-class" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="text-center py-6 text-sm text-gray-400 border-t border-[#13EAFD]/20 mt-20">
        © {new Date().getFullYear()} <span className="text-[#13EAFD]">Oktavianus</span> — Built with ❤️ & React
      </footer>

      {/* ===== PROJECT MODAL ===== */}
      <ProjectModal
        isOpen={!!selectedProject}
        onClose={handleCloseModal}
        project={selectedProject}
      />
    </>
  );
}

export default App;
