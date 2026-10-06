# Mongkhon Hatit - AI Portfolio

A responsive personal portfolio for an AI Full-Stack Engineer. Built with React, Vite, and Tailwind CSS, it presents experience, education, technology skills, project galleries, certifications, achievements, and a downloadable resume.

## Features

- Responsive layout for mobile, tablet, and desktop
- Portfolio sections for experience, education, technology stack, projects, certifications, and achievements
- SmartLoad 3D and Smart Warehouse 3D project galleries with image preview modal
- NVIDIA and Anthropic certification cards with company icons
- Downloadable resume
- Light and dark themes
- Admin panel for updating portfolio content
- Brand SVG icons stored locally for technology badges
- Prerendered HTML, meta tags, structured data, `robots.txt`, and `sitemap.xml` generated at build time
- Ready to deploy on Vercel

## Tech stack

- React 18
- Vite 6
- Tailwind CSS 3
- Lucide React icons
- Vercel Functions and Vercel Blob (production API and content storage)

## Running on Linux

### Requirements

- A Linux distribution that supports Node.js 22
- NVM (Node Version Manager)
- Git (if you clone the project from a repository)

### Install a project-specific Node.js with NVM

The project includes an `.nvmrc` file that pins the Node.js major version, similar in spirit to a `.venv`: switch to this Node version when you enter the project folder, without affecting the Node version used by other projects.

Install NVM if it is not already on the machine (see <https://github.com/nvm-sh/nvm> for the latest command):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```

Open a new terminal, or load NVM into the current shell:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

From the project folder, install and use the Node version listed in `.nvmrc`:

```bash
nvm install
nvm use
```

Check the versions:

```bash
node --version
npm --version
```

Each time you open a new terminal in this folder, run `nvm use` before `npm install`, `npm run dev`, or `npm run build`.

### Development server

Install dependencies:

```bash
npm install
```

Create the local settings file (it is ignored by Git):

```bash
cp .env.example .env
```

Edit `.env` and set the admin credentials and ports:

```env
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=replace-with-a-long-unique-password
COOKIE_SECURE=false
PORT=5173
AUTH_PORT=8787
```

`PORT` is the website port. `AUTH_PORT` is the internal API port used for login. The two must be different in development.

For example, to use port `5000`:

```env
PORT=5000
AUTH_PORT=8787
```

After saving `.env`, stop and restart `npm run dev`, then open `http://localhost:5000/` and `http://localhost:5000/admin/` as usual. The PM2 command (`npm run start`) uses the same `PORT=5000` value automatically.

Start the development server:

```bash
npm run dev
```

Open:

- Portfolio: `http://localhost:<PORT>/`
- Admin panel: `http://localhost:<PORT>/admin/`

## Admin panel

The admin panel authenticates through a server-side API. Its password is stored only in environment variables (the local `.env` file, or the Vercel project settings) and is never bundled into client JavaScript. Login sessions use short-lived `HttpOnly`, `SameSite=Strict` cookies, and repeated failed attempts are rate-limited.

For a self-hosted public deployment, serve the app only over HTTPS and set `COOKIE_SECURE=true` in the production environment. Do not deploy the `.env` file or expose port `8787`; use the included `npm run start` server behind an HTTPS reverse proxy.

Where content is stored depends on how the site is hosted:

- **Local and self-hosted (`server.mjs`)**: `Save changes` writes to `data/content.json` on the server. The file survives browser restarts, server restarts, and reboots. Back it up regularly in production.
- **Vercel**: `Save changes` writes to Vercel Blob. See [Deploying to Vercel](#deploying-to-vercel).

Browser local storage is only used as a temporary cache.

## Admin guide

1. Open `http://localhost:5173/admin/` and log in with the credentials from `.env`.
2. Pick a section from the left menu, then add, remove, or edit entries as needed.
3. Use the `↑` and `↓` buttons to reorder main items and sub-items.
4. Press `Save changes` after every edit. The button changes to `Saved` with a ✓ when the save succeeds.

### Uploading images

- PNG, JPG, WEBP, and GIF are supported, up to 700 KB per image.
- Images can be uploaded or removed in Stats, Experiences, Education, Tech Stack, Projects, Certifications, and Achievements.
- Each project has a cover image and a gallery of up to 5 images. Use `Set cover` to choose a gallery image as the cover.

### Projects and demos

In Admin > Projects, fill in `Demo URL` to show a `VIEW DEMO` button after `VIEW PROJECT` on the website. The link opens in a new tab.

### Multiple CV versions

In Admin > CV Download you can upload several PDF versions (up to 1 MB per file), name each version, press `Preview PDF`, delete unused files, and press `Use this version` to choose the CV served by the Download button on the website.

> Edits made in the admin panel are saved on the server, and every visitor sees the same content after refreshing the page.

## Deploying to Vercel

The project ships with `vercel.json` and Vercel Functions in the `api/` folder. `server.mjs` is only used locally and with PM2; Vercel does not run it.

1. Import the project into Vercel from a Git repository, or run `npx vercel` from the project folder. No build settings need to be changed.
2. In Project Settings > Environment Variables, set `ADMIN_USERNAME` and `ADMIN_PASSWORD`. Use a long password that you do not use anywhere else.
3. In the Storage tab, create a Private Blob store and connect it to the project. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically. If you create a Public store instead, also set `BLOB_ACCESS=public`.
4. Redeploy once so the environment variables take effect.

Things to know:

- The starting content on Vercel comes from `data/content.json`, which is deployed with the project. Once you press `Save changes` in the admin panel, the content is stored in Vercel Blob and replaces that file.
- Without a connected Blob store, the website still renders normally, but the admin panel cannot save.
- Vercel limits request bodies to 4.5 MB, so the whole content payload, including images and PDFs uploaded through the admin panel, must stay under that size. Put large images in `public/images/` and reference them by path instead.
- Admin sessions are signed cookies that last 4 hours. Changing `ADMIN_PASSWORD` invalidates existing sessions immediately.
- Login rate limiting on Vercel is tracked per function instance, so it is less strict than with `server.mjs`.

## SEO

`npm run build` runs three steps: the client build, a temporary SSR bundle, and `scripts/prerender.mjs`, which:

- renders the portfolio to HTML inside `dist/index.html`, so crawlers that do not run JavaScript see the real content
- generates the title, description, canonical URL, Open Graph tags, Twitter Card tags, and JSON-LD (`Person`, `WebSite`, `ProfilePage`) from the admin content
- generates `robots.txt` and `sitemap.xml`

The site's canonical URL comes from `SITE_URL`. If it is not set, the Vercel production domain is used automatically. **If you use a custom domain, set `SITE_URL=https://your-domain.com` in the Vercel environment variables.** When building locally without it, the canonical URL, `og:image`, and sitemap are skipped.

Things to know:

- The HTML and meta tags are generated at build time. After editing content in the admin panel, redeploy to refresh them. Visitors see the new content immediately either way.
- The image used when the link is shared is `public/og-image.jpg` (1200x630). Recreate it if the name or job title changes.
- The `/admin` page is marked `noindex`.
- After deploying, add the site to Google Search Console and submit `sitemap.xml`.

## Build for production

```bash
npm run build
```

The production output is created in `dist/`.

To run the production build with authentication on your own server:

```bash
npm run start
```

The production server reads `PORT` from `.env` (default `3000`). A real deployment must use HTTPS, set `COOKIE_SECURE=true`, and keep `.env` secret.

### Running with PM2 on Linux

PM2 keeps the app running, restarts it if the process stops, and starts it automatically after a reboot.

Install PM2 globally after switching to the project's Node version:

```bash
nvm use
npm install --global pm2
```

Reinstall `node_modules` from scratch and create the production build:

```bash
rm -rf node_modules
npm ci
npm run build
```

Start the app:

```bash
pm2 start npm --name ai-portfolio -- run start
```

Check status and logs:

```bash
pm2 status
pm2 logs ai-portfolio
```

Start PM2 automatically after a reboot (also run the command that `pm2 startup` prints):

```bash
pm2 startup
pm2 save
```

After changing code, rebuild and restart the app:

```bash
npm run build
pm2 restart ai-portfolio
```

Stop or remove the process:

```bash
pm2 stop ai-portfolio
pm2 delete ai-portfolio
```

## Project structure

```text
.
├── admin/                         # Admin route entry HTML
├── api/                           # Vercel Functions (auth and content API)
├── data/
│   └── content.json               # Saved content; starting content on Vercel
├── public/
│   ├── Resume.pdf                 # Downloadable resume
│   ├── og-image.jpg               # Link-sharing preview image
│   └── images/logos/              # Local technology brand SVGs
├── scripts/
│   └── prerender.mjs              # Build-time prerender and SEO files
├── src/
│   ├── assets/projects/
│   │   ├── smartload-3d/          # SmartLoad gallery images
│   │   └── smart-warehouse-3d/    # Smart Warehouse gallery images
│   ├── App.jsx                    # Portfolio UI
│   ├── AdminApp.jsx               # Content-management UI
│   ├── content.js                 # Portfolio data and admin settings
│   ├── entry-server.jsx           # Server render entry used by the prerender step
│   ├── index.css                  # Tailwind and custom styles
│   └── main.jsx                   # Route selection and app entry
├── server.mjs                     # Local and self-hosted server (dev, PM2)
├── vercel.json                    # Vercel build settings and headers
├── vite.config.js
└── package.json
```

## Updating content

Use `/admin/` to edit profile information, experience, education, skill groups, projects, certifications, and achievements in the browser.

For source-controlled default content, update `src/content.js`. Project images are grouped under `src/assets/projects/` and are imported from that file so Vite bundles them for production.

## License

This project is private and intended for the portfolio owner's use.
