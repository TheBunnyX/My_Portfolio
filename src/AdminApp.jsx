import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  FileJson,
  LockKeyhole,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  cloneContent,
  defaultPortfolioContent,
  fetchPortfolioContent,
  loadPortfolioContent,
  resetPortfolioContent,
  savePortfolioContent,
} from "./content";
import { iconOptions, resolveIcon } from "./icons";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const adminSections = [
  { id: "profile", label: "Profile" },
  { id: "cv", label: "CV" },
  { id: "stats", label: "Stats" },
  { id: "experiences", label: "Experiences" },
  { id: "education", label: "Education" },
  { id: "stack", label: "Stack" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "achievements", label: "Achievements" },
  { id: "json", label: "Raw JSON" },
];

function AdminCard({ children, className = "" }) {
  return (
    <div className={cn("rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]", className)}>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:focus:bg-slate-950"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, rows = 4, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:focus:bg-slate-950"
      />
    </label>
  );
}

function IconField({ label, value, onChange }) {
  const Icon = resolveIcon(value);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/60">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <Icon size={18} />
        </span>
        <input
          list="portfolio-icon-options"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Choose icon name"
          className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-white"
        />
      </div>
    </label>
  );
}

function ImageField({ label, value, onChange }) {
  return (
    <div className="space-y-3">
      <Field label={label} value={value} onChange={onChange} placeholder="/images/example.png or https://..." />
      {value ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-950/60">
          <img src={value} alt={label} className="h-40 w-full object-cover" />
        </div>
      ) : null}
    </div>
  );
}

const MAX_IMAGE_BYTES = 700 * 1024;
const MAX_CV_BYTES = 1024 * 1024;

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("Please choose an image."));
    if (!file.type.startsWith("image/")) return reject(new Error("Please choose a PNG, JPG, WEBP, or GIF image."));
    if (file.size > MAX_IMAGE_BYTES) return reject(new Error("Image must be 700 KB or smaller so it can be saved in this browser."));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read this image."));
    reader.readAsDataURL(file);
  });
}

function CvVersionUpload({ onUpload }) {
  const [error, setError] = useState("");
  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    try {
      if (!file || file.type !== "application/pdf") throw new Error("Please choose a PDF file.");
      if (file.size > MAX_CV_BYTES) throw new Error("PDF must be 1 MB or smaller so it can be saved in this browser.");
      const reader = new FileReader();
      reader.onload = () => onUpload({ id: `cv-${Date.now()}`, name: file.name.replace(/\.pdf$/i, ""), file: reader.result, downloadName: file.name });
      reader.onerror = () => setError("Unable to read this PDF.");
      reader.readAsDataURL(file);
      setError("");
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      event.target.value = "";
    }
  };
  return <div className="space-y-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"><Plus size={14} /> Upload PDF<input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={handleUpload} /></label><p className="text-xs text-slate-500 dark:text-slate-400">Upload multiple PDF versions, up to 1 MB each.</p>{error ? <p className="text-xs font-medium text-rose-500">{error}</p> : null}</div>;
}

function ProjectImageUpload({ label, value, onChange, onRemove }) {
  const [error, setError] = useState("");
  const handleUpload = async (event) => {
    try {
      setError("");
      onChange(await readImageFile(event.target.files?.[0]));
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      event.target.value = "";
    }
  };
  return (
    <div className="space-y-3">
      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200">
        <Plus size={14} /> Upload image
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={handleUpload} />
      </label>
      <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, WEBP, or GIF — up to 700 KB.</p>
      {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : null}
      {value ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-950/60"><img src={value} alt={label} className="h-40 w-full object-cover" /><button type="button" onClick={onRemove} className="m-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10"><Trash2 size={14} /> Delete image</button></div> : null}
    </div>
  );
}

function ProjectGallery({ images = [], coverImage, onAdd, onRemove, onSetCover }) {
  const [error, setError] = useState("");
  const handleUpload = async (event) => {
    try {
      setError("");
      if (images.length >= 5) throw new Error("A project can have up to 5 gallery images.");
      onAdd(await readImageFile(event.target.files?.[0]));
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      event.target.value = "";
    }
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Project gallery ({images.length}/5)</span><label className={cn("inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold", images.length >= 5 ? "cursor-not-allowed border-slate-200 text-slate-400 dark:border-white/10" : "cursor-pointer border-slate-200 text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200")}><Plus size={14} /> Add image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" disabled={images.length >= 5} onChange={handleUpload} /></label></div>
      <p className="text-xs text-slate-500 dark:text-slate-400">These images open when visitors select the project. Each upload must be 700 KB or smaller.</p>
      {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : null}
      {images.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{images.map((image, imageIndex) => <div key={`${imageIndex}-${image.slice(0, 24)}`} className={cn("overflow-hidden rounded-2xl border bg-slate-100 dark:bg-slate-950/60", coverImage === image ? "border-cyan-400 ring-2 ring-cyan-400/30" : "border-slate-200 dark:border-white/10")}><img src={image} alt={`Gallery image ${imageIndex + 1}`} className="aspect-square w-full object-cover" /><div className="m-2 flex flex-wrap items-center gap-2"><button type="button" disabled={imageIndex === 0} onClick={() => onAdd(images[imageIndex], imageIndex - 1)} className="text-xs font-bold text-slate-600 disabled:opacity-30 dark:text-slate-300">↑</button><button type="button" disabled={imageIndex === images.length - 1} onClick={() => onAdd(images[imageIndex], imageIndex + 1)} className="text-xs font-bold text-slate-600 disabled:opacity-30 dark:text-slate-300">↓</button><button type="button" disabled={coverImage === image} onClick={() => onSetCover(image)} className="text-xs font-bold text-cyan-600 disabled:cursor-default disabled:text-emerald-600 dark:text-cyan-300">{coverImage === image ? "Cover" : "Set cover"}</button><button type="button" onClick={() => onRemove(imageIndex)} className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600"><Trash2 size={13} /> Delete</button></div></div>)}</div> : <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">No gallery images yet.</p>}
    </div>
  );
}

function ReorderButtons({ index, total, onMove }) {
  return <div className="flex items-center gap-1"><button type="button" disabled={index === 0} onClick={() => onMove(index - 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-sm font-bold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:text-slate-300" aria-label="Move up">↑</button><button type="button" disabled={index === total - 1} onClick={() => onMove(index + 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-sm font-bold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:text-slate-300" aria-label="Move down">↓</button></div>;
}

function IconImageField({ label, value, onChange }) {
  return (
    <div className="space-y-3">
      <Field
        label={label}
        value={value}
        onChange={onChange}
        placeholder="/images/icon.png, /images/icon.webp, /images/icon.jpg"
      />
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Supports `.png`, `.webp`, `.jpg`, `.jpeg`. If filled, this image overrides the icon name.
      </p>
      {value ? (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-4 dark:border-white/10 dark:bg-slate-950/60">
          <img src={value} alt={label} className="h-12 w-12 rounded-xl object-contain bg-white p-2 dark:bg-slate-900" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Preview</span>
        </div>
      ) : null}
    </div>
  );
}

function StringListEditor({ label, values, onChange, addLabel = "Add item" }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <button
          type="button"
          onClick={() => onChange([...(values || []), ""])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"
        >
          <Plus size={14} />
          {addLabel}
        </button>
      </div>
      <div className="space-y-2">
        {(values || []).map((item, index) => (
          <div key={`${label}-${index}`} className="flex items-start gap-2">
            <textarea
              rows={2}
              value={item}
              onChange={(event) =>
                onChange(values.map((entry, entryIndex) => (entryIndex === index ? event.target.value : entry)))
              }
              className="min-h-[54px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white dark:border-white/10 dark:bg-slate-950/60 dark:text-white dark:focus:bg-slate-950"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, entryIndex) => entryIndex !== index))}
              className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-rose-200 text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10"
            >
              <Trash2 size={16} />
            </button>
            <ReorderButtons index={index} total={values.length} onMove={(targetIndex) => { const next = [...values]; const [moved] = next.splice(index, 1); next.splice(targetIndex, 0, moved); onChange(next); }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function IconItemListEditor({ label, items, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <button
          type="button"
          onClick={() => onChange([...(items || []), { name: "", icon: "Sparkles", iconImage: "" }])}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"
        >
          <Plus size={14} />
          Add item
        </button>
      </div>
      <div className="space-y-4">
        {(items || []).map((item, index) => (
          <div key={`${label}-${index}`} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
              <Field
                label="Name"
                value={item.name}
                onChange={(value) =>
                  onChange(items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, name: value } : entry)))
                }
              />
              <IconField
                label="Icon"
                value={item.icon}
                onChange={(value) =>
                  onChange(items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, icon: value } : entry)))
                }
              />
              <ProjectImageUpload
                label="Icon Image"
                value={item.iconImage}
                onChange={(value) =>
                  onChange(items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, iconImage: value } : entry)))
                }
                onRemove={() => onChange(items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, iconImage: "" } : entry)))}
              />
              <ReorderButtons index={index} total={items.length} onMove={(targetIndex) => { const next = [...items]; const [moved] = next.splice(index, 1); next.splice(targetIndex, 0, moved); onChange(next); }} />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, entryIndex) => entryIndex !== index))}
                className="mt-7 grid h-12 w-12 place-items-center rounded-2xl border border-rose-200 text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p> : null}
    </div>
  );
}

function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [cvPreview, setCvPreview] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const [content, setContent] = useState(() => loadPortfolioContent());
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(loadPortfolioContent(), null, 2));

  useEffect(() => {
    document.title = authed ? "Admin | Mongkhon Hatit" : "Admin Login | Mongkhon Hatit";
  }, [authed]);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "same-origin" })
      .then((response) => setAuthed(response.ok))
      .catch(() => setAuthed(false))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    fetchPortfolioContent().then((remoteContent) => {
      if (remoteContent) setContent(remoteContent);
    }).catch(() => setError("Unable to load saved content from the server."));
  }, []);

  useEffect(() => {
    setJsonDraft(JSON.stringify(content, null, 2));
  }, [content]);

  const updateContent = (producer) => {
    setContent((prev) => {
      const next = cloneContent(prev);
      producer(next);
      return next;
    });
    setSaveMessage("");
    setSaved(false);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
      setAuthed(true);
      setPassword("");
      return;
      }
      const result = await response.json().catch(() => ({}));
      setError(result.error || "Invalid admin credentials.");
    } catch {
      setError("Unable to contact the authentication server.");
    }
  };

  const handleSave = async () => {
    setError("");
    try {
      const response = await fetch("/api/content", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Unable to save content.");
      }
      savePortfolioContent(content);
      setSaveMessage("Saved to the server successfully.");
      setSaved(true);
    } catch (saveError) {
      setSaved(false);
      setError(saveError.message || "Unable to save content.");
    }
  };

  const handleReset = () => {
    const next = resetPortfolioContent();
    setContent(next);
    setSaveMessage("Reset to default content.");
    setSaved(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    setAuthed(false);
    setPassword("");
    setSaveMessage("");
  };

  const handleSaveJson = async () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      setContent(parsed);
      await new Promise((resolve) => setTimeout(resolve, 0));
      const response = await fetch("/api/content", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: parsed }) });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Unable to save JSON.");
      savePortfolioContent(parsed);
      setSaveMessage("JSON saved to the server.");
      setError("");
      setSaved(true);
    } catch (jsonError) {
      setSaved(false);
      setError(jsonError instanceof SyntaxError ? "Raw JSON is invalid." : (jsonError.message || "Unable to save JSON."));
    }
  };

  const previewUrl = useMemo(() => `${window.location.origin}/`, []);

  if (!authChecked) {
    return <div className="grid min-h-screen place-items-center bg-slate-100 text-sm font-medium text-slate-600 dark:bg-ink dark:text-slate-300">Checking secure session…</div>;
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 dark:bg-ink">
        <datalist id="portfolio-icon-options">
          {iconOptions.map((icon) => (
            <option key={icon} value={icon} />
          ))}
        </datalist>
        <div className="mx-auto max-w-md">
          <AdminCard className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <LockKeyhole size={20} />
              </span>
              <div>
                <h1 className="font-display text-2xl font-extrabold text-slate-950 dark:text-white">Admin Login</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Manage portfolio content at `/admin`.</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleLogin}>
              <Field label="Username" value={username} onChange={setUsername} />
              <Field label="Password" value={password} onChange={setPassword} type="password" />
              {error ? <p className="text-sm font-medium text-rose-500">{error}</p> : null}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                <ShieldCheck size={16} />
                Login
              </button>
            </form>
          </AdminCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-ink dark:text-white">
      <datalist id="portfolio-icon-options">
        {iconOptions.map((icon) => (
          <option key={icon} value={icon} />
        ))}
      </datalist>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 lg:flex-row">
        <aside className="lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:w-72 lg:self-start">
          <AdminCard className="flex h-full flex-col">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-600">Portfolio Admin</p>
              <h1 className="mt-2 font-display text-2xl font-extrabold">Content Manager</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Edit text, images, and icons. Changes are stored locally in your browser.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {adminSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
                    activeSection === section.id
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-200 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]",
                  )}
                >
                  {section.label}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 dark:border-white/10">
              <button
                type="button"
                onClick={handleSave}
                className={cn("inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition", saved ? "bg-emerald-500 text-white hover:bg-emerald-400" : "bg-cyan-500 text-slate-950 hover:bg-cyan-400")}
              >
                {saved ? <Check size={16} /> : <Save size={16} />}
                {saved ? "Saved" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-amber-400 hover:text-amber-600 dark:border-white/10 dark:text-slate-200"
              >
                <RotateCcw size={16} />
                Reset defaults
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"
              >
                <Eye size={16} />
                Open website
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-bold text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10"
              >
                <LogOut size={16} />
                Logout
              </button>
              {saveMessage ? <p className="text-xs font-medium text-emerald-600">{saveMessage}</p> : null}
              {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : null}
            </div>
          </AdminCard>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          {activeSection === "profile" ? (
            <AdminCard>
              <AdminSectionHeader title="Profile" description="Hero text, social links, email, and profile image." />
              <div className="grid gap-5 lg:grid-cols-2">
                <Field label="Name" value={content.profile.name} onChange={(value) => updateContent((next) => { next.profile.name = value; })} />
                <Field label="Role" value={content.profile.role} onChange={(value) => updateContent((next) => { next.profile.role = value; })} />
                <Field label="Email" value={content.profile.email} onChange={(value) => updateContent((next) => { next.profile.email = value; })} />
                <Field label="Location" value={content.profile.location} onChange={(value) => updateContent((next) => { next.profile.location = value; })} />
                <Field label="GitHub URL" value={content.profile.github} onChange={(value) => updateContent((next) => { next.profile.github = value; })} />
                <Field label="LinkedIn URL" value={content.profile.linkedin} onChange={(value) => updateContent((next) => { next.profile.linkedin = value; })} />
                <Field label="Availability Badge" value={content.profile.availability} onChange={(value) => updateContent((next) => { next.profile.availability = value; })} />
                <Field label="Based In Label" value={content.profile.basedInLabel} onChange={(value) => updateContent((next) => { next.profile.basedInLabel = value; })} />
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
                <TextAreaField label="Bio" rows={6} value={content.profile.bio} onChange={(value) => updateContent((next) => { next.profile.bio = value; })} />
                <ImageField label="Profile Image" value={content.profile.image} onChange={(value) => updateContent((next) => { next.profile.image = value; })} />
              </div>
            </AdminCard>
          ) : null}

          {activeSection === "cv" ? (
            <AdminCard>
              <AdminSectionHeader title="CV Download" description="Upload multiple PDF versions and choose which version visitors download." />
              <div className="grid gap-5 lg:grid-cols-2">
                <Field label="Button Label" value={content.cv.label} onChange={(value) => updateContent((next) => { next.cv.label = value; })} />
                <CvVersionUpload onUpload={(version) => updateContent((next) => { next.cv.versions = [...(next.cv.versions || []), version]; next.cv.activeVersionId = version.id; next.cv.file = version.file; next.cv.downloadName = version.downloadName; })} />
              </div>
              <div className="mt-6 space-y-3">
                {(content.cv.versions || []).map((version, index) => {
                  const active = version.id === content.cv.activeVersionId;
                  return <div key={version.id || index} className={cn("flex flex-wrap items-center gap-3 rounded-2xl border p-4", active ? "border-cyan-400 bg-cyan-50/60 dark:bg-cyan-400/10" : "border-slate-200 dark:border-white/10")}>
                    <button type="button" onClick={() => updateContent((next) => { next.cv.activeVersionId = version.id; next.cv.file = version.file; next.cv.downloadName = version.downloadName; })} className={cn("rounded-xl px-3 py-2 text-xs font-bold", active ? "bg-cyan-500 text-slate-950" : "border border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-200")}>{active ? "Active version" : "Use this version"}</button>
                    <button type="button" onClick={() => setCvPreview(version.file)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"><Eye size={14} /> Preview PDF</button>
                    <div className="min-w-[180px] flex-1"><Field label="Version name" value={version.name} onChange={(value) => updateContent((next) => { next.cv.versions[index].name = value; })} /></div>
                    <div className="min-w-[180px] flex-1"><Field label="Download file name" value={version.downloadName} onChange={(value) => updateContent((next) => { next.cv.versions[index].downloadName = value; if (next.cv.activeVersionId === version.id) next.cv.downloadName = value; })} /></div>
                    <button type="button" disabled={(content.cv.versions || []).length === 1} onClick={() => updateContent((next) => { const remaining = next.cv.versions.filter((_, versionIndex) => versionIndex !== index); next.cv.versions = remaining; if (next.cv.activeVersionId === version.id) { const fallback = remaining[0]; next.cv.activeVersionId = fallback.id; next.cv.file = fallback.file; next.cv.downloadName = fallback.downloadName; } })} className="mt-7 inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-500 disabled:cursor-not-allowed disabled:opacity-30 dark:border-rose-400/20"><Trash2 size={14} /> Delete</button>
                  </div>;
                })}
              </div>
              {cvPreview ? <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10"><div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10"><p className="text-sm font-bold">PDF Preview</p><button type="button" onClick={() => setCvPreview("")} className="text-xs font-bold text-slate-500 hover:text-rose-500">Close preview</button></div><iframe title="CV PDF preview" src={cvPreview} className="h-[680px] w-full bg-slate-100 dark:bg-slate-950" /></div> : null}
            </AdminCard>
          ) : null}

          {activeSection === "stats" ? (
            <AdminCard>
              <AdminSectionHeader title="Stats" description="Add, remove, or rewrite the hero stats strip." />
              <div className="space-y-4">
                {content.stats.map((stat, index) => (
                  <div key={`stat-${index}`} className="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-[180px_1fr_220px_auto] dark:border-white/10">
                    <Field label="Value" value={stat.value} onChange={(value) => updateContent((next) => { next.stats[index].value = value; })} />
                    <Field label="Label" value={stat.label} onChange={(value) => updateContent((next) => { next.stats[index].label = value; })} />
                    <ProjectImageUpload label="Stat image" value={stat.image} onChange={(value) => updateContent((next) => { next.stats[index].image = value; })} onRemove={() => updateContent((next) => { next.stats[index].image = ""; })} />
                    <ReorderButtons index={index} total={content.stats.length} onMove={(targetIndex) => updateContent((next) => { const [moved] = next.stats.splice(index, 1); next.stats.splice(targetIndex, 0, moved); })} />
                    <button
                      type="button"
                      onClick={() => updateContent((next) => { next.stats.splice(index, 1); })}
                      className="mt-7 grid h-12 w-12 place-items-center rounded-2xl border border-rose-200 text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateContent((next) => { next.stats.push({ value: "", label: "" }); })}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"
                >
                  <Plus size={16} />
                  Add stat
                </button>
              </div>
            </AdminCard>
          ) : null}

          {activeSection === "experiences" ? (
            <AdminCard>
              <AdminSectionHeader title="Experiences" description="Edit company logos, icons, dates, and bullet points." />
              <div className="space-y-6">
                {content.experiences.map((experience, index) => (
                  <div key={`experience-${index}`} className="rounded-3xl border border-slate-200 p-5 dark:border-white/10">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-extrabold">{experience.company || `Experience ${index + 1}`}</h3>
                      <div className="flex items-center gap-2"><ReorderButtons index={index} total={content.experiences.length} onMove={(targetIndex) => updateContent((next) => { const [moved] = next.experiences.splice(index, 1); next.experiences.splice(targetIndex, 0, moved); })} /><button
                        type="button"
                        onClick={() => updateContent((next) => { next.experiences.splice(index, 1); })}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button></div>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                      <Field label="Company" value={experience.company} onChange={(value) => updateContent((next) => { next.experiences[index].company = value; })} />
                      <Field label="Title" value={experience.title} onChange={(value) => updateContent((next) => { next.experiences[index].title = value; })} />
                      <Field label="Location" value={experience.location} onChange={(value) => updateContent((next) => { next.experiences[index].location = value; })} />
                      <Field
                        label="Dates"
                        value={experience.dates}
                        onChange={(value) => updateContent((next) => { next.experiences[index].dates = value; })}
                        placeholder="Jan 2025 - Jul 2025"
                      />
                      <IconField label="Timeline Icon" value={experience.icon} onChange={(value) => updateContent((next) => { next.experiences[index].icon = value; })} />
                      <Field label="Color Theme" value={experience.color} onChange={(value) => updateContent((next) => { next.experiences[index].color = value; })} placeholder="cyan or violet" />
                    </div>
                    <div className="mt-5">
                      <ProjectImageUpload label="Company Logo" value={experience.companyLogo} onChange={(value) => updateContent((next) => { next.experiences[index].companyLogo = value; })} onRemove={() => updateContent((next) => { next.experiences[index].companyLogo = ""; })} />
                    </div>
                    <div className="mt-5">
                      <StringListEditor
                        label="Responsibilities"
                        values={experience.responsibilities}
                        onChange={(value) => updateContent((next) => { next.experiences[index].responsibilities = value; })}
                        addLabel="Add bullet"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    updateContent((next) => {
                      next.experiences.push({
                        icon: "BriefcaseBusiness",
                        title: "",
                        company: "",
                        companyLogo: "",
                        location: "",
                        dates: "Jan 2025 - Jul 2025",
                        color: "cyan",
                        responsibilities: [""],
                      });
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"
                >
                  <Plus size={16} />
                  Add experience
                </button>
              </div>
            </AdminCard>
          ) : null}

          {activeSection === "education" ? (
            <AdminCard>
              <AdminSectionHeader title="Education" description="Add, remove, and arrange schools with their degree, GPA, image, and coursework." />
              <div className="space-y-6">
                {(content.education.schools || []).map((school, index) => (
                  <div key={`school-${index}`} className="rounded-3xl border border-slate-200 p-5 dark:border-white/10">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-extrabold">{school.school || `School ${index + 1}`}</h3>
                      <div className="flex items-center gap-2"><ReorderButtons index={index} total={content.education.schools.length} onMove={(targetIndex) => updateContent((next) => { const [moved] = next.education.schools.splice(index, 1); next.education.schools.splice(targetIndex, 0, moved); })} /><button type="button" onClick={() => updateContent((next) => { next.education.schools.splice(index, 1); })} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10"><Trash2 size={14} /> Remove</button></div>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                      <Field label="School" value={school.school} onChange={(value) => updateContent((next) => { next.education.schools[index].school = value; })} />
                      <Field label="Degree" value={school.degree} onChange={(value) => updateContent((next) => { next.education.schools[index].degree = value; })} />
                      <Field label="Dates" value={school.dates} onChange={(value) => updateContent((next) => { next.education.schools[index].dates = value; })} />
                      <Field label="GPA" value={school.gpa} onChange={(value) => updateContent((next) => { next.education.schools[index].gpa = value; })} />
                    </div>
                    <div className="mt-5"><ProjectImageUpload label="School image" value={school.image} onChange={(value) => updateContent((next) => { next.education.schools[index].image = value; })} onRemove={() => updateContent((next) => { next.education.schools[index].image = ""; })} /></div>
                    <div className="mt-5"><StringListEditor label="Relevant coursework" values={school.coursework || []} onChange={(value) => updateContent((next) => { next.education.schools[index].coursework = value; })} addLabel="Add course" /></div>
                  </div>
                ))}
                <button type="button" onClick={() => updateContent((next) => { next.education.schools.push({ school: "", degree: "", dates: "", gpa: "", image: "", coursework: [] }); })} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"><Plus size={16} /> Add school</button>
              </div>
            </AdminCard>
          ) : null}

          {activeSection === "stack" ? (
            <AdminCard>
              <AdminSectionHeader title="Tech Stack" description="Manage groups, icons, and each skill badge." />
            <div className="space-y-6">
                {content.stack.map((group, index) => (
                  <div key={`stack-${index}`} className="rounded-3xl border border-slate-200 p-5 dark:border-white/10">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-extrabold">{group.title || `Stack Group ${index + 1}`}</h3>
                      <div className="flex items-center gap-2"><ReorderButtons index={index} total={content.stack.length} onMove={(targetIndex) => updateContent((next) => { const [moved] = next.stack.splice(index, 1); next.stack.splice(targetIndex, 0, moved); })} /><button
                        type="button"
                        onClick={() => updateContent((next) => { next.stack.splice(index, 1); })}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button></div>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                      <Field label="Group Title" value={group.title} onChange={(value) => updateContent((next) => { next.stack[index].title = value; })} />
                      <IconField label="Group Icon" value={group.icon} onChange={(value) => updateContent((next) => { next.stack[index].icon = value; })} />
                    </div>
                    <div className="mt-5">
                      <ProjectImageUpload
                        label="Group Icon Image"
                        value={group.iconImage}
                        onChange={(value) => updateContent((next) => { next.stack[index].iconImage = value; })}
                        onRemove={() => updateContent((next) => { next.stack[index].iconImage = ""; })}
                      />
                    </div>
                    <div className="mt-5">
                      <IconItemListEditor
                        label="Skills"
                        items={group.items}
                        onChange={(value) => updateContent((next) => { next.stack[index].items = value; })}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    updateContent((next) => {
                      next.stack.push({
                        title: "",
                        icon: "Sparkles",
                        iconImage: "",
                        items: [{ name: "", icon: "Code2", iconImage: "" }],
                      });
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"
                >
                  <Plus size={16} />
                  Add stack group
                </button>
              </div>
            </AdminCard>
          ) : null}

          {activeSection === "projects" ? (
            <AdminCard>
              <AdminSectionHeader title="Projects" description="Upload or delete the homepage cover and up to 5 gallery images per project." />
              <div className="space-y-6">
                {content.projects.map((project, index) => (
                  <div key={`project-${index}`} className="rounded-3xl border border-slate-200 p-5 dark:border-white/10">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-extrabold">{project.title || `Project ${index + 1}`}</h3>
                      <div className="flex items-center gap-2"><ReorderButtons index={index} total={content.projects.length} onMove={(targetIndex) => updateContent((next) => { const [moved] = next.projects.splice(index, 1); next.projects.splice(targetIndex, 0, moved); })} /><button
                        type="button"
                        onClick={() => updateContent((next) => { next.projects.splice(index, 1); })}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button></div>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                      <Field label="Title" value={project.title} onChange={(value) => updateContent((next) => { next.projects[index].title = value; })} />
                      <Field label="Demo URL" value={project.demoUrl} onChange={(value) => updateContent((next) => { next.projects[index].demoUrl = value; })} placeholder="https://example.com" type="url" />
                      <ProjectImageUpload label="Homepage cover image" value={project.image} onChange={(value) => updateContent((next) => { next.projects[index].image = value; })} onRemove={() => updateContent((next) => { next.projects[index].image = next.projects[index].images?.[0] || ""; })} />
                    </div>
                    <div className="mt-5"><ProjectGallery images={project.images || []} coverImage={project.image} onSetCover={(value) => updateContent((next) => { next.projects[index].image = value; })} onAdd={(value, targetIndex) => updateContent((next) => { const gallery = [...(next.projects[index].images || [])]; if (typeof targetIndex === "number") { const fromIndex = gallery.indexOf(value); gallery.splice(fromIndex, 1); gallery.splice(targetIndex, 0, value); } else { gallery.push(value); } next.projects[index].images = gallery; })} onRemove={(imageIndex) => updateContent((next) => { const removed = next.projects[index].images[imageIndex]; const remaining = next.projects[index].images.filter((_, currentIndex) => currentIndex !== imageIndex); next.projects[index].images = remaining; if (next.projects[index].image === removed) next.projects[index].image = remaining[0] || ""; })} /></div>
                    <div className="mt-5">
                      <TextAreaField label="Description" value={project.description} onChange={(value) => updateContent((next) => { next.projects[index].description = value; })} rows={4} />
                    </div>
                    <div className="mt-5">
                      <StringListEditor
                        label="Tags"
                        values={project.tags}
                        onChange={(value) => updateContent((next) => { next.projects[index].tags = value; })}
                        addLabel="Add tag"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateContent((next) => { next.projects.push({ title: "", description: "", image: "", images: [], demoUrl: "", tags: [""] }); })}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"
                >
                  <Plus size={16} />
                  Add project
                </button>
              </div>
            </AdminCard>
          ) : null}

          {activeSection === "certifications" ? (
            <AdminCard>
              <AdminSectionHeader title="Certifications" description="Manage certificate cards and images." />
              <div className="space-y-6">
                {content.certifications.map((certificate, index) => (
                  <div key={`certification-${index}`} className="rounded-3xl border border-slate-200 p-5 dark:border-white/10">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-extrabold">{certificate.title || `Certification ${index + 1}`}</h3>
                      <div className="flex items-center gap-2"><ReorderButtons index={index} total={content.certifications.length} onMove={(targetIndex) => updateContent((next) => { const [moved] = next.certifications.splice(index, 1); next.certifications.splice(targetIndex, 0, moved); })} /><button
                        type="button"
                        onClick={() => updateContent((next) => { next.certifications.splice(index, 1); })}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button></div>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                      <Field label="Title" value={certificate.title} onChange={(value) => updateContent((next) => { next.certifications[index].title = value; })} />
                      <Field label="Issuer" value={certificate.issuer} onChange={(value) => updateContent((next) => { next.certifications[index].issuer = value; })} />
                      <Field label="Date" value={certificate.date} onChange={(value) => updateContent((next) => { next.certifications[index].date = value; })} />
                      <Field label="Initials" value={certificate.initials} onChange={(value) => updateContent((next) => { next.certifications[index].initials = value; })} />
                      <Field label="Color Theme" value={certificate.color} onChange={(value) => updateContent((next) => { next.certifications[index].color = value; })} />
                      <ProjectImageUpload label="Certificate Image" value={certificate.image} onChange={(value) => updateContent((next) => { next.certifications[index].image = value; })} onRemove={() => updateContent((next) => { next.certifications[index].image = ""; })} />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateContent((next) => { next.certifications.push({ title: "", issuer: "", date: "", initials: "", color: "blue", image: "" }); })}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"
                >
                  <Plus size={16} />
                  Add certification
                </button>
              </div>
            </AdminCard>
          ) : null}

          {activeSection === "achievements" ? (
            <AdminCard>
              <AdminSectionHeader title="Achievements" description="Edit award cards, positions, descriptions, and cover images." />
              <div className="space-y-6">
                {content.achievements.map((achievement, index) => (
                  <div key={`achievement-${index}`} className="rounded-3xl border border-slate-200 p-5 dark:border-white/10">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-extrabold">{achievement.title || `Achievement ${index + 1}`}</h3>
                      <div className="flex items-center gap-2"><ReorderButtons index={index} total={content.achievements.length} onMove={(targetIndex) => updateContent((next) => { const [moved] = next.achievements.splice(index, 1); next.achievements.splice(targetIndex, 0, moved); })} /><button
                        type="button"
                        onClick={() => updateContent((next) => { next.achievements.splice(index, 1); })}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:hover:bg-rose-400/10"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button></div>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-2">
                      <Field label="Place" value={achievement.place} onChange={(value) => updateContent((next) => { next.achievements[index].place = value; })} />
                      <Field label="Color Theme" value={achievement.color} onChange={(value) => updateContent((next) => { next.achievements[index].color = value; })} />
                      <IconField label="Achievement Icon" value={achievement.icon} onChange={(value) => updateContent((next) => { next.achievements[index].icon = value; })} />
                      <Field label="Title" value={achievement.title} onChange={(value) => updateContent((next) => { next.achievements[index].title = value; })} />
                      <ProjectImageUpload label="Achievement Image" value={achievement.image} onChange={(value) => updateContent((next) => { next.achievements[index].image = value; })} onRemove={() => updateContent((next) => { next.achievements[index].image = ""; })} />
                    </div>
                    <div className="mt-5">
                      <TextAreaField label="Description" value={achievement.description} onChange={(value) => updateContent((next) => { next.achievements[index].description = value; })} rows={4} />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateContent((next) => { next.achievements.push({ place: "", title: "", description: "", color: "cyan", icon: "Trophy", image: "" }); })}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"
                >
                  <Plus size={16} />
                  Add achievement
                </button>
              </div>
            </AdminCard>
          ) : null}

          {activeSection === "json" ? (
            <AdminCard>
              <AdminSectionHeader title="Raw JSON Editor" description="For full control over the content schema. Save carefully." />
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                <FileJson size={14} />
                Advanced Mode
              </div>
              <textarea
                rows={26}
                value={jsonDraft}
                onChange={(event) => {
                  setJsonDraft(event.target.value);
                  setError("");
                  setSaveMessage("");
                }}
                className="w-full rounded-3xl border border-slate-200 bg-slate-950 px-5 py-4 font-mono text-sm leading-7 text-cyan-100 outline-none transition focus:border-cyan-400 dark:border-white/10"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveJson}
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  <Save size={16} />
                  Save JSON
                </button>
                <button
                  type="button"
                  onClick={() => setJsonDraft(JSON.stringify(defaultPortfolioContent, null, 2))}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200"
                >
                  <RotateCcw size={16} />
                  Load defaults into editor
                </button>
              </div>
            </AdminCard>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default AdminApp;
