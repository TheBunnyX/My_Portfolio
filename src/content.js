import { useEffect, useState } from "react";
import nvidiaCertificate from "./certificate-nvidia.png";
import claudeCertificate from "./certificate-claude.png";
import nvidiaLogo from "./nvidia-logo.svg";
import anthropicLogo from "./anthropic-logo.svg";
import smartWarehouseImage1 from "./assets/projects/smart-warehouse-3d/1.png";
import smartWarehouseImage2 from "./assets/projects/smart-warehouse-3d/2.png";
import smartWarehouseImage3 from "./assets/projects/smart-warehouse-3d/3.png";
import smartWarehouseImage4 from "./assets/projects/smart-warehouse-3d/4.png";
import smartLoadImage1 from "./assets/projects/smartload-3d/1A.png";
import smartLoadImage2 from "./assets/projects/smartload-3d/2A.png";
import smartLoadImage3 from "./assets/projects/smartload-3d/3A.png";

export const PORTFOLIO_CONTENT_STORAGE_KEY = "portfolio-content-v8";
export const PORTFOLIO_CONTENT_EVENT = "portfolio-content-updated";
export const defaultPortfolioContent = {
  profile: {
    name: "Mongkhon Hatit",
    role: "AI Full-Stack Engineer",
    email: "mongkolhatit@gmail.com",
    location: "Suan Luang, Bangkok, Thailand",
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/in/mongkhon-hatit/",
    bio: "AI Engineer with 2+ years of experience building and deploying production-ready solutions across LLMs, RAG/MCP agents, computer vision, and optimization systems. I focus on reliable, practical AI with measurable business impact.",
    image: "/images/profile.webp",
    availability: "OPEN TO WORK · 2026",
    basedInLabel: "Based in",
  },
  cv: {
    file: "/Resume.pdf",
    downloadName: "Mongkhon-Hatit-Resume.pdf",
    label: "Download Resume",
    activeVersionId: "current",
    versions: [{ id: "current", name: "Current Resume", file: "/Resume.pdf", downloadName: "Mongkhon-Hatit-Resume.pdf" }],
  },
  stats: [
    { value: "2+", label: "Years building" },
    { value: "95.4%", label: "Model accuracy achieved" },
    { value: "~70%", label: "Faster operations" },
    { value: "420K", label: "THB saved annually" },
  ],
  experiences: [
    {
      icon: "BrainCircuit",
      title: "AI Full-Stack Engineer",
      company: "LANDY HOME (THAILAND) CO., LTD",
      companyLogo: "/images/logo-landyhome.svg",
      location: "Bangkok, Thailand",
      dates: "Aug 2025 - Present",
      color: "cyan",
      responsibilities: [
        "Designed and implemented an n8n workflow for Oil Engineering customer-service operations, integrating Google Workspace and scheduled email notifications to cut processing time from 87 to 26 hours per cycle.",
        "Designed and deployed an enterprise RAG and MCP chatbot integrating ChatGPT, Gemini, and Claude for secure, context-aware access to internal knowledge and tools, reducing annual operating costs by approximately 420,000 THB.",
        "Developed and deployed a scalable Synology NAS file and folder management system, centralizing 92% of departmental storage with metadata, RBAC, and streamlined directory operations.",
        "Built an end-to-end document review pipeline with validation, feedback loops, and standardized PDF reports, reducing manual processing time by 73%.",
      ],
    },
    {
      icon: "Network",
      title: "AI Researcher",
      company: "NSTDA (NECTEC) - AINRG Department",
      companyLogo: "/images/logo-nectec.svg",
      location: "Bangkok, Thailand",
      dates: "Aug 2024 - May 2025",
      color: "violet",
      responsibilities: [
        "Designed and executed an end-to-end drone-based aerial-data pipeline covering large-scale point-cloud collection, preprocessing, visualization, and time-series analysis.",
        "Developed, tested, and validated volume-change detection and classification algorithms through iterative experiments and performance benchmarking.",
        "Achieved 95.4% accuracy and demonstrated reliability for real-world deployment.",
      ],
    },
    {
      icon: "BrainCircuit",
      title: "AI Engineer",
      company: "Somporn Mould & Parts Ltd. - HCU Applied AI Industry Project",
      companyLogo: "",
      location: "Bangkok, Thailand",
      dates: "Jan 2023 - Mar 2023",
      color: "cyan",
      responsibilities: [
        "Developed AI-driven predictive-maintenance and optimization solutions at Somporn Mould & Parts Ltd. Learning Camp.",
        "Applied machine learning to predict machine conditions, optimize operational parameters, and estimate maintenance timing.",
        "Helped reduce unplanned downtime and improve overall machine efficiency.",
      ],
    },
  ],
  education: {
    schools: [{
      school: "Huachiew Chalermprakiet University",
      degree: "Bachelor of Artificial Intelligence",
      dates: "Jan 2021 - May 2025",
      gpa: "3.69",
      image: "",
      coursework: [
        "Natural Language Processing",
        "Large Language Models",
        "Computer Vision",
        "Deep Learning",
        "Machine Learning",
        "AI Ecosystem",
        "Optimization Techniques",
      ],
    }],
  },
  stack: [
    {
      title: "Programming",
      icon: "Code2",
      iconImage: "",
      items: [
        { name: "Python", icon: "Code2", iconImage: "/images/logos/python.svg" },
        { name: "JavaScript", icon: "Code2", iconImage: "/images/logos/javascript.svg" },
        { name: "Dart", icon: "Code2", iconImage: "/images/logos/dart.svg" },
        { name: "C", icon: "Code2", iconImage: "/images/logos/c.svg" },
        { name: "SQL", icon: "Database", iconImage: "" },
        { name: "Rust", icon: "Code2", iconImage: "/images/logos/rust.svg" },
      ],
    },
    {
      title: "ML & Computer Vision",
      icon: "BrainCircuit",
      iconImage: "",
      items: [
        { name: "PyTorch", icon: "BrainCircuit", iconImage: "/images/logos/pytorch.svg" },
        { name: "Pandas", icon: "Database", iconImage: "/images/logos/pandas.svg" },
        { name: "NumPy", icon: "Database", iconImage: "/images/logos/numpy.svg" },
        { name: "OpenCV", icon: "BrainCircuit", iconImage: "/images/logos/opencv.svg" },
        { name: "SAM3", icon: "BrainCircuit", iconImage: "/images/logos/meta.svg" },
        { name: "YOLO", icon: "BrainCircuit", iconImage: "/images/logos/ultralytics.svg" },
        { name: "LangChain", icon: "GitBranch", iconImage: "/images/logos/langchain.svg" },
      ],
    },
    {
      title: "Databases",
      icon: "Database",
      iconImage: "",
      items: [
        { name: "PostgreSQL", icon: "Database", iconImage: "/images/logos/postgresql.svg" },
        { name: "MySQL", icon: "Database", iconImage: "/images/logos/mysql.svg" },
        { name: "MongoDB", icon: "Database", iconImage: "/images/logos/mongodb.svg" },
        { name: "SQLite", icon: "Database", iconImage: "/images/logos/sqlite.svg" },
        { name: "Pinecone", icon: "Database", iconImage: "" },
      ],
    },
    {
      title: "Cloud & DevOps",
      icon: "Cloud",
      iconImage: "",
      items: [
        { name: "AWS", icon: "Cloud", iconImage: "/images/logos/amazonwebservices.svg" },
        { name: "Docker", icon: "Container", iconImage: "/images/logos/docker.svg" },
        { name: "Azure", icon: "Cloud", iconImage: "/images/logos/microsoftazure.svg" },
        { name: "Kubernetes", icon: "Container", iconImage: "/images/logos/kubernetes.svg" },
        { name: "Git", icon: "GitBranch", iconImage: "/images/logos/git.svg" },
        { name: "GitLab", icon: "GitBranch", iconImage: "/images/logos/gitlab.svg" },
        { name: "GitHub", icon: "GitBranch", iconImage: "/images/logos/github.svg" },
        { name: "Linux", icon: "ServerCog", iconImage: "/images/logos/linux.svg" },
      ],
    },
    {
      title: "Web Development",
      icon: "Globe2",
      iconImage: "",
      items: [
        { name: "Flask", icon: "ServerCog", iconImage: "/images/logos/flask.svg" },
        { name: "FastAPI", icon: "ServerCog", iconImage: "/images/logos/fastapi.svg" },
        { name: "Tailwind CSS", icon: "Code2", iconImage: "/images/logos/tailwindcss.svg" },
        { name: "Next.js", icon: "Globe2", iconImage: "/images/logos/nextdotjs.svg" },
        { name: "React.js", icon: "Code2", iconImage: "/images/logos/react.svg" },
        { name: "Node.js", icon: "ServerCog", iconImage: "/images/logos/nodedotjs.svg" },
      ],
    },
    {
      title: "LLM & Agent Tools",
      icon: "Bot",
      iconImage: "",
      items: [
        { name: "LLM API Integration (ChatGPT, Claude, Gemini)", icon: "Bot", iconImage: "" },
        { name: "RAG", icon: "Database", iconImage: "" },
        { name: "MCP", icon: "GitBranch", iconImage: "/images/logos/modelcontextprotocol.svg" },
        { name: "n8n AI Automation", icon: "Workflow", iconImage: "/images/logos/n8n.svg" },
      ],
    },
  ],
  projects: [
    {
      title: "SmartLoad 3D",
      description:
        "A React-based truck cargo optimization platform using 3D bin-packing, weight balancing, collision detection, and loading constraints. It achieved 93% average space utilization and optimized up to 200 cargo items per load in about 2.5 seconds.",
      image: smartLoadImage1,
      images: [smartLoadImage1, smartLoadImage2, smartLoadImage3],
      tags: ["React", "3D Bin Packing", "Optimization", "JavaScript"],
    },
    {
      title: "Smart Warehouse 3D",
      description:
        "An AI-powered warehouse optimization platform combining demand forecasting, intelligent SKU slotting, route optimization, and interactive 3D visualization. It reduced simulated picking distance by 40% across 500 SKUs.",
      image: smartWarehouseImage1,
      images: [smartWarehouseImage1, smartWarehouseImage2, smartWarehouseImage3, smartWarehouseImage4],
      tags: ["AI", "Forecasting", "Route Optimization", "3D Visualization"],
    },
  ],
  certifications: [
    {
      title: "AI for All From Basics to GenAI Practice",
      issuer: "NVIDIA",
      date: "Dec 2025",
      initials: "AI",
      color: "blue",
      image: nvidiaCertificate,
      iconImage: nvidiaLogo,
    },
    {
      title: "AI Fluency: Framework & Foundations",
      issuer: "Claude",
      date: "2026",
      initials: "AF",
      color: "violet",
      image: claudeCertificate,
      iconImage: anthropicLogo,
    },
  ],
  achievements: [
    {
      place: "Top 5",
      title: "AI Thailand Hackathon 2024 (AI Cooking)",
      description:
        "Competed across OCR, optimization, NLP, and AI model training challenges for real-world problem statements, advancing to the Top 5.",
      color: "amber",
      icon: "Trophy",
      image: "",
    },
    {
      place: "Silver Medal",
      title: "National Software Contest (NSC) Thailand 2021",
      description:
        "Developed a face-recognition school check-in system with COVID-19 temperature screening using CorgiDude, earning the Silver Medal at NSC Thailand 2021.",
      color: "slate",
      icon: "Medal",
      image: "",
    },
  ],
};

export const cloneContent = (content = defaultPortfolioContent) =>
  JSON.parse(JSON.stringify(content));

const normalizeExperienceDates = (experience) => {
  if (!experience?.dates) return experience;

  const legacyDatesMap = {
    "2024 - Present": "Jan 2024 - Present",
    "2022 - 2024": "Jul 2022 - Dec 2024",
    "2024 — Present": "Jan 2024 - Present",
    "2022 — 2024": "Jul 2022 - Dec 2024",
  };

  return {
    ...experience,
    dates: legacyDatesMap[experience.dates] || experience.dates,
  };
};

const normalizeEducation = (education) => {
  if (Array.isArray(education?.schools)) return education;
  // Keep previously saved single-school content working after the schema upgrade.
  if (education?.school || education?.degree) {
    const { school, degree, dates, gpa, image = "", coursework = [] } = education;
    return { schools: [{ school, degree, dates, gpa, image, coursework }] };
  }
  return { schools: [] };
};

const normalizeCv = (cv) => {
  const legacy = cv || {};
  const versions = Array.isArray(legacy.versions) && legacy.versions.length
    ? legacy.versions
    : [{ id: "current", name: "Current Resume", file: legacy.file || "/Resume.pdf", downloadName: legacy.downloadName || "Resume.pdf" }];
  const active = versions.find((version) => version.id === legacy.activeVersionId) || versions[0];
  return { ...legacy, versions, activeVersionId: active.id, file: active.file, downloadName: active.downloadName, label: legacy.label || "Download Resume" };
};

const mergeWithDefaults = (defaults, incoming) => {
  if (Array.isArray(defaults)) {
    return Array.isArray(incoming) ? incoming : cloneContent(defaults);
  }

  if (defaults && typeof defaults === "object") {
    const next = {};
    for (const key of Object.keys(defaults)) {
      next[key] = mergeWithDefaults(defaults[key], incoming?.[key]);
    }
    if (incoming && typeof incoming === "object") {
      for (const key of Object.keys(incoming)) {
        if (!(key in next)) next[key] = incoming[key];
      }
    }
    return next;
  }

  return incoming ?? defaults;
};

// Content saved while running the dev server stores bundled images as "/src/..." paths, which
// only exist in development. Map them back to the URLs Vite emits for the current build.
const bundledAssets = Object.fromEntries(
  Object.entries(import.meta.glob(["./assets/**/*.{png,jpg,jpeg,webp,svg}", "./*.{png,svg}"], { eager: true, import: "default", query: "?url" }))
    .map(([path, url]) => [`/src/${path.slice(2)}`, url]),
);

const resolveBundledAssets = (value) => {
  if (typeof value === "string") return bundledAssets[value] || value;
  if (Array.isArray(value)) return value.map(resolveBundledAssets);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveBundledAssets(item)]));
  return value;
};

export const normalizePortfolioContent = (raw) => {
  if (!raw) return cloneContent();
  try {
    const parsed = resolveBundledAssets(typeof raw === "string" ? JSON.parse(raw) : raw);
    const merged = mergeWithDefaults(defaultPortfolioContent, parsed);
    merged.experiences = (merged.experiences || []).map(normalizeExperienceDates);
    merged.education = normalizeEducation(parsed.education || merged.education);
    merged.cv = normalizeCv(parsed.cv || merged.cv);
    return merged;
  } catch {
    return cloneContent();
  }
};

export const loadPortfolioContent = () => {
  if (typeof window === "undefined") return cloneContent();
  return normalizePortfolioContent(window.localStorage.getItem(PORTFOLIO_CONTENT_STORAGE_KEY));
};

export const savePortfolioContent = (content) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(PORTFOLIO_CONTENT_STORAGE_KEY, JSON.stringify(content)); } catch { /* Server storage remains the source of truth. */ }
  window.dispatchEvent(new Event(PORTFOLIO_CONTENT_EVENT));
};

export const fetchPortfolioContent = async () => {
  const response = await fetch("/api/content", { credentials: "same-origin" });
  if (!response.ok) throw new Error("Unable to load saved content.");
  const { content } = await response.json();
  if (!content) return null;
  const normalized = normalizePortfolioContent(content);
  savePortfolioContent(normalized);
  return normalized;
};

export const resetPortfolioContent = () => {
  const next = cloneContent();
  savePortfolioContent(next);
  return next;
};

export const usePortfolioContent = (initialContent) => {
  const [content, setContent] = useState(() => initialContent || loadPortfolioContent());

  useEffect(() => {
    const sync = () => setContent(loadPortfolioContent());
    window.addEventListener("storage", sync);
    window.addEventListener(PORTFOLIO_CONTENT_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(PORTFOLIO_CONTENT_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    fetchPortfolioContent().then((remoteContent) => {
      if (remoteContent) setContent(remoteContent);
    }).catch(() => {});
  }, []);

  return [content, setContent];
};
