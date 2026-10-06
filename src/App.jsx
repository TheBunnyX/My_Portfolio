import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Award,
  Check,
  ChevronRight,
  Clipboard,
  Copy,
  Download,
  Eye,
  Github,
  Linkedin,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { usePortfolioContent } from "./content";
import { resolveIcon } from "./icons";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const setPointerVars = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
};

const clearPointerVars = (event) => {
  event.currentTarget.style.removeProperty("--pointer-x");
  event.currentTarget.style.removeProperty("--pointer-y");
};

function Card({ children, className = "", ...props }) {
  return (
    <div
      onMouseMove={setPointerVars}
      onMouseLeave={clearPointerVars}
      className={cn("glass interactive-card rounded-3xl", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function IconAsset({ iconName, iconImage, className = "", size = 18, imgClassName = "" }) {
  const Icon = resolveIcon(iconName);

  if (iconImage) {
    return (
      <img
        src={iconImage}
        alt=""
        aria-hidden="true"
        className={cn("object-contain", imgClassName)}
      />
    );
  }

  return <Icon size={size} className={className} />;
}

function SectionHeader({ index, eyebrow, title, copy }) {
  return (
    <div className="mb-10 max-w-2xl reveal-up" data-reveal>
      <div className="flex items-center gap-3">
        <span className="font-display text-xs font-bold text-slate-400 dark:text-slate-600">
          {index}
        </span>
        <span className="h-px w-8 bg-slate-300 dark:bg-slate-700" />
        <p className="eyebrow">{eyebrow}</p>
      </div>
      <h2 className="heading">{title}</h2>
      {copy && (
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
          {copy}
        </p>
      )}
    </div>
  );
}

function Navbar({ dark, setDark, content }) {
  const [open, setOpen] = useState(false);
  const links = ["About", "Experience", "Education", "Stack", "Projects", "Awards"];

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pt-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
        <a href="#about" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 font-display text-sm font-extrabold text-white shadow-lg dark:bg-white dark:text-slate-950">
            MH
          </span>
          <span className="hidden font-display text-sm font-bold tracking-tight sm:block">
            {content.profile.name}
          </span>
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-slate-900/5 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              {link}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={content.cv.file}
            download={content.cv.downloadName}
            className="hidden h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 sm:inline-flex"
          >
            <Download size={16} />
            {content.cv.label}
          </a>
          <button
            onClick={() => setDark(!dark)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
            aria-label="Toggle color theme"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/70 md:hidden dark:border-white/10 dark:bg-white/5"
            aria-label="Toggle navigation"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="glass mx-auto mt-2 max-h-[calc(100vh-5.5rem)] max-w-6xl overflow-y-auto rounded-2xl p-2 md:hidden">
          <a
            href={content.cv.file}
            download={content.cv.downloadName}
            onClick={() => setOpen(false)}
            className="mb-2 flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
          >
            {content.cv.label}
            <Download size={16} />
          </a>
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-900/5 dark:hover:bg-white/5"
            >
              {link}
              <ChevronRight size={16} />
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

function Hero({ content }) {
  const [copied, setCopied] = useState(false);
  const [firstName, ...restName] = content.profile.name.split(" ");
  const lastName = restName.join(" ");

  const copyEmail = async () => {
    await navigator.clipboard.writeText(content.profile.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section
      id="about"
      onMouseMove={setPointerVars}
      onMouseLeave={clearPointerVars}
      className="hero-aurora relative flex min-h-screen items-center overflow-hidden pt-24 sm:pt-28"
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_30%,rgba(34,211,238,.14),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(167,139,250,.16),transparent_28%),radial-gradient(circle_at_65%_80%,rgba(59,130,246,.10),transparent_30%)]" />
      <div className="noise absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06]" />
      <div className="absolute left-[8%] top-[24%] -z-10 h-56 w-56 animate-float rounded-full bg-cyan-300/20 blur-[90px]" />
      <div className="absolute right-[4%] top-[18%] -z-10 h-72 w-72 animate-float-delayed rounded-full bg-violet-400/20 blur-[100px]" />

      <div className="section-shell grid items-center gap-10 py-12 sm:gap-16 sm:py-16 lg:grid-cols-[1.15fr_.85fr]">
        <div className="reveal-up" data-reveal>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {content.profile.availability}
          </div>
          <p className="eyebrow mb-4">Hello, I’m</p>
          <h1 className="font-display text-[clamp(2.8rem,14vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.06em] text-slate-950 sm:text-7xl lg:text-[5.5rem] dark:text-white">
            {firstName}
            <span className="block bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
              {lastName || firstName}.
            </span>
          </h1>
          <p className="mt-6 font-display text-lg font-semibold text-slate-700 sm:text-xl dark:text-slate-300">
            {content.profile.role}
          </p>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-400">
            {content.profile.bio}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={copyEmail}
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-white dark:text-slate-950"
            >
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Email copied" : "Copy my email"}
            </button>
            <a
              href={content.cv.file}
              download={content.cv.downloadName}
              className="glass inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:text-cyan-600"
            >
              <Download size={17} />
              {content.cv.label}
            </a>
            <a
              href={content.profile.github}
              target="_blank"
              rel="noreferrer"
              className="glass grid h-12 w-12 place-items-center rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:text-cyan-600"
              aria-label="GitHub profile"
            >
              <Github size={19} />
            </a>
            <a
              href={content.profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="glass grid h-12 w-12 place-items-center rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:text-cyan-600"
              aria-label="LinkedIn profile"
            >
              <Linkedin size={19} />
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-200 pt-7 sm:mt-12 sm:flex sm:flex-wrap sm:gap-x-8 dark:border-white/10">
            {content.stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                {stat.image ? <img src={stat.image} alt="" className="h-9 w-9 rounded-xl object-cover" /> : null}
                <div>
                <p className="font-display text-2xl font-extrabold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal-up relative mx-auto w-full max-w-[19rem] sm:max-w-md" data-reveal>
          <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-cyan-400/20 to-violet-500/20 blur-2xl" />
          <div className="glass relative overflow-hidden rounded-[2.5rem] p-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-900">
              <img
                src={content.profile.image}
                alt={`Portrait of ${content.profile.name}, ${content.profile.role}`}
                width="900"
                height="1125"
                fetchpriority="high"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/90 to-transparent" />
              <div className="absolute bottom-5 right-5">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md">
                  <ArrowUpRight size={19} />
                </span>
              </div>
            </div>
          </div>
          <div className="glass absolute -right-4 top-12 hidden rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 shadow-glow sm:block dark:text-slate-300">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-400" />
            BUILD · SHIP · LEARN
          </div>
        </div>
      </div>
      <a
        href="#experience"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 md:flex"
      >
        Scroll
        <ArrowDown size={15} className="animate-bounce" />
      </a>
    </section>
  );
}

function TimelineItem({ item, last }) {
  const Icon = resolveIcon(item.icon);
  return (
    <div className="reveal-up relative grid gap-5 pl-16 sm:grid-cols-[180px_1fr] sm:gap-8 sm:pl-20" data-reveal>
      {!last && (
        <span className="absolute left-[25px] top-14 h-[calc(100%+1rem)] w-px bg-gradient-to-b from-slate-300 to-transparent sm:left-[33px] dark:from-slate-700" />
      )}
      <div
        className={cn(
          "absolute left-0 top-0 grid h-[52px] w-[52px] place-items-center rounded-2xl border shadow-lg sm:h-[66px] sm:w-[66px]",
          item.color === "cyan"
            ? "border-cyan-300/40 bg-cyan-100 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300"
            : "border-violet-300/40 bg-violet-100 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300",
        )}
      >
        <Icon size={24} />
      </div>
      <div className="pt-1 sm:text-right">
        <p className="font-display text-sm font-bold text-slate-500 dark:text-slate-400">{item.dates}</p>
        <p className="mt-1 text-xs text-slate-400">{item.location}</p>
      </div>
      <Card className="p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/50 sm:p-7">
        <div className="flex items-center gap-3">
          {item.companyLogo && (
            <img
              src={item.companyLogo}
              alt={`${item.company} logo`}
              loading="lazy"
              decoding="async"
              className="h-11 w-11 rounded-full object-cover shadow-lg ring-1 ring-slate-200/70 dark:ring-white/10"
            />
          )}
          <p className="eyebrow">{item.company}</p>
        </div>
        <h3 className="mt-2 font-display text-xl font-extrabold tracking-tight sm:text-2xl">{item.title}</h3>
        <ul className="mt-5 space-y-3">
          {item.responsibilities.map((responsibility) => (
            <li key={responsibility} className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-cyan-500" />
              {responsibility}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Experience({ content }) {
  return (
    <section id="experience" className="py-20 sm:py-32">
      <div className="section-shell">
        <SectionHeader
          index="01"
          eyebrow="Experience"
          title="Building AI that survives the real world."
          copy="I work across research, product, and infrastructure to move machine-learning ideas from notebook to dependable user experience."
        />
        <div className="space-y-10">
          {content.experiences.map((item, index) => (
            <TimelineItem key={`${item.company}-${index}`} item={item} last={index === content.experiences.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Education({ education }) {
  const schools = education.schools || (education.school ? [education] : []);

  return (
    <section id="education" className="relative py-20 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-slate-100/60 dark:bg-white/[0.015]" />
      <div className="section-shell">
        <SectionHeader
          index="02"
          eyebrow="Education"
          title="A strong foundation for applied AI."
          copy="Academic training that supports practical work across intelligent systems, data, and optimization."
        />
        <div className="space-y-5">
          {schools.map((education, index) => (
        <Card key={`${education.school}-${index}`} className="reveal-up overflow-hidden p-6 sm:p-8" data-reveal>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <p className="eyebrow">{education.school}</p>
              <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{education.degree}</h3>
              <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">{education.dates} · GPA {education.gpa}</p>
            </div>
            {education.image ? <img src={education.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" /> : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-700 dark:text-cyan-300"><IconAsset iconName="GraduationCap" size={26} /></span>}
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-white/10">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Relevant coursework</p>
            <div className="flex flex-wrap gap-2.5">
              {education.coursework.map((course) => (
                <TechBadge key={course} name={course} iconName="Lightbulb" />
              ))}
            </div>
          </div>
        </Card>
          ))}
          {!schools.length ? <Card className="p-6 text-sm text-slate-500 dark:text-slate-400">Education details are being updated.</Card> : null}
        </div>
      </div>
    </section>
  );
}

function TechBadge({ name, iconName, iconImage }) {
  return (
    <span className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3.5 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,.14)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-cyan-300/40">
      <IconAsset
        iconName={iconName}
        iconImage={iconImage}
        size={15}
        className="text-cyan-600 transition-transform duration-300 group-hover:rotate-6 dark:text-cyan-300"
        imgClassName="h-[15px] w-[15px] transition-transform duration-300 group-hover:rotate-6"
      />
      {name}
    </span>
  );
}

function TechStack({ content }) {
  return (
    <section id="stack" className="relative py-20 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-slate-100/60 dark:bg-white/[0.015]" />
      <div className="section-shell">
        <SectionHeader
          index="03"
          eyebrow="Toolkit"
          title="A practical stack for intelligent products."
          copy="The tools change. The goal stays steady: clear architecture, measurable quality, and experiences people actually enjoy using."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {content.stack.map((group) => {
            return (
              <Card key={group.title} className="group reveal-up p-6 transition-all duration-300 hover:-translate-y-1 sm:p-7" data-reveal>
                <div className="mb-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white transition-transform duration-300 group-hover:rotate-3 dark:bg-white dark:text-slate-950">
                    <IconAsset
                      iconName={group.icon}
                      iconImage={group.iconImage}
                      size={19}
                      imgClassName="h-[19px] w-[19px] object-contain"
                    />
                  </span>
                  <h3 className="font-display text-lg font-extrabold">{group.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {group.items.map((item) => (
                    <TechBadge
                      key={`${group.title}-${item.name}`}
                      name={item.name}
                      iconName={item.icon}
                      iconImage={item.iconImage}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, onOpen }) {
  const projectImages = project.images?.length ? project.images : [project.image];

  return (
    <Card className="group reveal-up overflow-hidden transition-all duration-300 hover:-translate-y-2" data-reveal>
      <button
        onClick={() => onOpen(projectImages, project.title)}
        onMouseMove={setPointerVars}
        onMouseLeave={clearPointerVars}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-slate-900 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-400"
        aria-label={`Preview ${project.title}`}
      >
        <img
          src={project.image}
          alt={`${project.title} project screenshot`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute inset-0 grid place-items-center bg-slate-950/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-950 shadow-xl">
            <Eye size={19} />
          </span>
        </span>
        {projectImages.length > 1 && (
          <span className="absolute bottom-4 right-4 rounded-full bg-slate-950/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            {projectImages.length} images
          </span>
        )}
      </button>
      <div className="flex min-h-[300px] flex-col p-6 sm:p-7">
        <h3 className="font-display text-2xl font-extrabold tracking-tight">{project.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{project.description}</p>
        <div className="mt-6">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Tools</p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
          <button
            type="button"
            onClick={() => onOpen(projectImages, project.title)}
            className="inline-flex items-center gap-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-300"
          >
            View project <ArrowUpRight size={15} />
          </button>
          {project.demoUrl ? <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-300">View demo <ArrowUpRight size={15} /></a> : null}
        </div>
      </div>
    </Card>
  );
}

function Projects({ content, onOpen }) {
  return (
    <section id="projects" className="py-20 sm:py-32">
      <div className="section-shell">
        <SectionHeader
          index="04"
          eyebrow="Selected work"
          title="Ideas, engineered into experiences."
          copy="A selection of systems where model quality, product thinking, and thoughtful interfaces meet."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {content.projects.map((project) => (
            <ProjectCard key={project.title} project={project} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificationCard({ certificate, onOpen }) {
  const colorClass =
    certificate.color === "blue"
      ? "from-blue-500 to-cyan-400"
      : "from-violet-500 to-fuchsia-400";

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <button
        onClick={() => onOpen(certificate.image, certificate.title)}
        onMouseMove={setPointerVars}
        onMouseLeave={clearPointerVars}
        className="interactive-card reveal-up relative block aspect-[16/10] w-full overflow-hidden bg-slate-100 text-left dark:bg-slate-900"
        data-reveal
      >
        {certificate.image ? (
          <img src={certificate.image} alt={`${certificate.title} certificate`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-8 text-center text-white">
            <span className="font-display text-lg font-extrabold">{certificate.title}</span>
          </div>
        )}
        <span className="absolute inset-0 grid place-items-center bg-slate-950/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-950 shadow-xl">
            <Eye size={19} />
          </span>
        </span>
      </button>
      <div className="flex gap-4 p-5">
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl p-2 font-display text-xs font-extrabold shadow-sm", certificate.iconImage ? "bg-white" : `bg-gradient-to-br text-white ${colorClass}`)}>
          {certificate.iconImage ? (
            <img src={certificate.iconImage} alt={`${certificate.issuer} logo`} className="h-full w-full object-contain" />
          ) : (
            certificate.initials
          )}
        </span>
        <div>
          <h3 className="font-display text-base font-extrabold">{certificate.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{certificate.issuer} · {certificate.date}</p>
        </div>
      </div>
    </Card>
  );
}

function Awards({ content, onOpen }) {
  return (
    <section id="awards" className="relative py-20 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-slate-100/60 dark:bg-white/[0.015]" />
      <div className="section-shell">
        <SectionHeader
          index="05"
          eyebrow="Recognition"
          title="Milestones worth keeping."
          copy="Credentials and challenges that sharpened how I think, collaborate, and build."
        />
        <div className="space-y-10">
          <div>
            <div className="mb-5 flex items-center gap-2">
              <Clipboard size={17} className="text-cyan-600" />
              <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.15em]">Certifications</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.certifications.map((certificate) => (
                <CertificationCard key={certificate.title} certificate={certificate} onOpen={onOpen} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-5 flex items-center gap-2">
              <Award size={17} className="text-violet-500" />
              <h3 className="font-display text-sm font-extrabold uppercase tracking-[0.15em]">Achievements</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {content.achievements.map((achievement) => {
                const AchievementIcon = resolveIcon(achievement.icon);
                const colorClass =
                  achievement.color === "amber"
                    ? "bg-amber-400/15 text-amber-600 dark:text-amber-300"
                    : achievement.color === "slate"
                      ? "bg-slate-300/50 text-slate-600 dark:bg-slate-300/15 dark:text-slate-200"
                      : "bg-cyan-400/15 text-cyan-700 dark:text-cyan-300";

                return (
                  <Card key={achievement.title} className="reveal-up overflow-hidden transition-all duration-300 hover:-translate-y-1" data-reveal>
                    {achievement.image && (
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                        <img
                          src={achievement.image}
                          alt={achievement.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex gap-5 p-5 sm:p-6">
                      <span className={cn("grid h-14 min-w-14 place-items-center rounded-2xl", colorClass)}>
                        <AchievementIcon size={27} strokeWidth={2.2} />
                      </span>
                      <div>
                        <p className={cn("text-xs font-bold uppercase tracking-[0.14em]", colorClass.split(" ").filter((value) => value.startsWith("text-") || value.startsWith("dark:text-")).join(" "))}>
                          {achievement.place}
                        </p>
                        <h4 className="mt-1 font-display text-base font-extrabold">{achievement.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{achievement.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ content }) {
  return (
    <footer className="px-5 pb-5">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-16 text-center text-white sm:px-10 dark:border dark:border-white/10">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[90px]" />
        <div className="relative">
          <p className="eyebrow">Have an ambitious idea?</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl">
            Let’s build something intelligent.
          </h2>
          <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
            <span>© 2026 {content.profile.name}</span>
            <span>Designed with intent. Engineered with care.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ImageModal({ modal, onClose, onSelect }) {
  useEffect(() => {
    if (!modal) return undefined;
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modal, onClose]);

  if (!modal) return null;
  const images = modal.images || (modal.image ? [modal.image] : []);
  const activeIndex = Math.min(modal.activeIndex || 0, Math.max(images.length - 1, 0));
  const activeImage = images[activeIndex];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 p-4 backdrop-blur-xl"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={modal.title}
    >
      <button
        onClick={onClose}
        className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition-all duration-300 hover:rotate-90 hover:bg-white/20"
        aria-label="Close image"
      >
        <X size={20} />
      </button>
      <div className="max-h-[88vh] max-w-6xl" onClick={(event) => event.stopPropagation()}>
        <img src={activeImage} alt={modal.title} className="max-h-[72vh] w-auto rounded-2xl object-contain shadow-2xl" />
        <p className="mt-4 text-center font-display text-sm font-bold text-white">{modal.title}</p>
        {images.length > 1 && (
          <div className="mt-4 flex max-w-full justify-center gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition",
                  index === activeIndex ? "border-cyan-300" : "border-white/20 opacity-70 hover:opacity-100",
                )}
                aria-label={`View image ${index + 1}`}
              >
                <img src={image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App({ initialContent }) {
  const [content] = usePortfolioContent(initialContent);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  const [modal, setModal] = useState(null);
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, index) => ({
      id: index,
      size: 6 + (index % 4) * 3,
      top: 8 + ((index * 11) % 78),
      left: 6 + ((index * 17) % 86),
      speed: 0.35 + (index % 5) * 0.08,
      delay: (index % 6) * 0.7,
    })),
  );
  const appRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const nodes = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!appRef.current) return;
      const scrollY = window.scrollY || window.pageYOffset;
      appRef.current.style.setProperty("--scroll-y", `${scrollY}px`);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = (imageOrImages, title) => {
    const images = (Array.isArray(imageOrImages) ? imageOrImages : [imageOrImages]).filter(Boolean);
    if (images.length) setModal({ images, title, activeIndex: 0 });
  };

  const selectModalImage = (activeIndex) => {
    setModal((current) => (current ? { ...current, activeIndex } : current));
  };

  return (
    <div
      ref={appRef}
      onMouseMove={setPointerVars}
      onMouseLeave={clearPointerVars}
      className="interactive-background min-h-screen overflow-hidden"
    >
      <div className="background-orb background-orb-cyan" />
      <div className="background-orb background-orb-violet" />
      <div className="background-grid" />
      <div className="background-spotlight" />
      <div className="background-particles" aria-hidden="true">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="background-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              "--particle-top": particle.top,
              "--particle-left": particle.left,
              "--particle-speed": particle.speed,
            }}
          />
        ))}
      </div>
      <Navbar dark={dark} setDark={setDark} content={content} />
      <main>
        <Hero content={content} />
        <Experience content={content} />
        <Education education={content.education} />
        <TechStack content={content} />
        <Projects content={content} onOpen={openModal} />
        <Awards content={content} onOpen={openModal} />
      </main>
      <Footer content={content} />
      <ImageModal modal={modal} onClose={() => setModal(null)} onSelect={selectModalImage} />
    </div>
  );
}
