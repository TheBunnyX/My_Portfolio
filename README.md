# Mongkhon Hatit - AI Portfolio

A responsive personal portfolio for an AI Full-Stack Engineer. Built with React, Vite, and Tailwind CSS, it presents experience, education, technology skills, project galleries, certifications, achievements, and a downloadable resume.

## Features

- Responsive layout for mobile, tablet, and desktop
- Portfolio sections for experience, education, technology stack, projects, certifications, and achievements
- SmartLoad 3D and Smart Warehouse 3D project galleries with image preview modal
- NVIDIA and Anthropic certification cards with company icons
- Downloadable resume
- Light and dark themes
- Local admin panel for updating portfolio content
- Brand SVG icons stored locally for technology badges

## Tech stack

- React 18
- Vite 6
- Tailwind CSS 3
- Lucide React icons

## เปิดใช้งานบน Linux

### ความต้องการ

- Linux distribution ที่รองรับ Node.js 18 ขึ้นไป
- NVM (Node Version Manager)
- Git (หาก clone โปรเจกต์จาก repository)

### ติดตั้ง Node.js แบบเฉพาะโปรเจกต์ด้วย NVM

โปรเจกต์นี้มีไฟล์ `.nvmrc` กำหนด Node.js major version ที่ใช้ไว้ เหมือนแนวคิดของ `.venv`: เมื่อเข้าโฟลเดอร์โปรเจกต์ ให้สลับมาใช้ Node version นี้ก่อน โดยไม่กระทบ Node version ของโปรเจกต์อื่น

ติดตั้ง NVM หากเครื่องยังไม่มี (ดูคำสั่งเวอร์ชันล่าสุดจาก <https://github.com/nvm-sh/nvm>):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```

เปิด terminal ใหม่ หรือโหลด NVM ใน shell ปัจจุบัน:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

จากโฟลเดอร์โปรเจกต์ ติดตั้งและใช้งาน Node version ที่ระบุใน `.nvmrc`:

```bash
nvm install
nvm use
```

ตรวจสอบเวอร์ชัน:

```bash
node --version
npm --version
```

ทุกครั้งที่เปิด terminal ใหม่และเข้ามาในโฟลเดอร์นี้ ให้รัน `nvm use` ก่อน `npm install`, `npm run dev` หรือ `npm run build`

### Development server

Install dependencies:

```bash
npm install
```

สร้างไฟล์ตั้งค่า local (ไฟล์นี้ถูก ignore โดย Git):

```bash
cp .env.example .env
```

แก้ไข `.env` และกำหนดข้อมูล Admin รวมถึงพอร์ต:

```env
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=replace-with-a-long-unique-password
COOKIE_SECURE=false
PORT=5173
AUTH_PORT=8787
```

`PORT` คือพอร์ตหน้าเว็บไซต์ ส่วน `AUTH_PORT` คือพอร์ต API ภายในสำหรับล็อกอิน โดยต้องเป็นคนละพอร์ตใน development

ตัวอย่างหากต้องการใช้พอร์ต `5000`:

```env
PORT=5000
AUTH_PORT=8787
```

หลังบันทึก `.env` ให้หยุดและเริ่มใหม่ด้วย `npm run dev` แล้วเปิด `http://localhost:5000/` และ `http://localhost:5000/admin/` ได้ตามปกติ คำสั่ง PM2 (`npm run start`) ก็จะใช้ค่า `PORT=5000` เดียวกันโดยอัตโนมัติ

เริ่ม development server:

```bash
npm run dev
```

เปิดใช้งาน:

- Portfolio: `http://localhost:<PORT>/`
- Admin panel: `http://localhost:<PORT>/admin/`

## Admin panel

The admin panel authenticates through a server-side API. Its password is stored only in the local `.env` file and is never bundled into client JavaScript. Login sessions use short-lived `HttpOnly`, `SameSite=Strict` cookies and repeated failed attempts are rate-limited.

For a public deployment, serve the app only over HTTPS and set `COOKIE_SECURE=true` in the production environment. Do not deploy the `.env` file or expose port `8787`; use the included `npm run start` server behind an HTTPS reverse proxy.

Content changes are stored on the server in `data/content.json` after pressing `Save changes`; browser local storage is only used as a temporary cache. The file remains after the browser closes, server restarts, or the machine reboots. Back up `data/content.json` regularly in production.

## คู่มือใช้งาน Admin

1. เปิด `http://localhost:5173/admin/` แล้วล็อกอินด้วยข้อมูลใน `.env`
2. เลือกหมวดจากเมนูด้านซ้าย จากนั้นเพิ่ม, ลบ หรือแก้ไขข้อมูลได้ตามต้องการ
3. ใช้ปุ่ม `↑` และ `↓` เพื่อเรียงลำดับรายการหลักและรายการย่อย
4. กด `Save changes` หลังแก้ไขทุกครั้ง ปุ่มจะเปลี่ยนเป็น `Saved` พร้อมเครื่องหมาย ✓ เมื่อบันทึกสำเร็จ

### การอัปโหลดรูป

- รองรับ PNG, JPG, WEBP และ GIF ขนาดไม่เกิน 700 KB ต่อรูป
- อัปโหลดหรือลบรูปได้ใน Stats, Experiences, Education, Tech Stack, Projects, Certifications และ Achievements
- Projects มีรูปหน้าปกและ gallery ได้ไม่เกิน 5 รูป เลือกรูปใน gallery เป็นรูปหน้าปกได้ด้วยปุ่ม `Set cover`

### Projects และ Demo

ใน Admin > Projects ใส่ `Demo URL` เพื่อให้ปุ่ม `VIEW DEMO` ปรากฏหลัง `VIEW PROJECT` บนหน้าเว็บไซต์ ลิงก์จะเปิดแท็บใหม่

### CV หลายเวอร์ชัน

ใน Admin > CV Download สามารถอัปโหลด PDF ได้หลายเวอร์ชัน (ไม่เกิน 1 MB ต่อไฟล์), ตั้งชื่อแต่ละเวอร์ชัน, กด `Preview PDF`, ลบไฟล์ที่ไม่ใช้ และกด `Use this version` เพื่อกำหนด CV ที่ปุ่ม Download บนหน้าเว็บจะใช้

> การแก้ไขจาก Admin จะบันทึกลงไฟล์ `data/content.json` บนเซิร์ฟเวอร์ และผู้เข้าชมทุกคนจะเห็นข้อมูลชุดเดียวกันหลังรีเฟรชหน้าเว็บ ควรสำรองไฟล์นี้เป็นประจำ

## Deploy บน Vercel

โปรเจกต์มี `vercel.json` และ Vercel Functions ในโฟลเดอร์ `api/` พร้อมใช้งานแล้ว (`server.mjs` ใช้เฉพาะ local และ PM2 เท่านั้น Vercel ไม่ได้รันไฟล์นี้)

1. Import โปรเจกต์เข้า Vercel จาก Git repository หรือรัน `npx vercel` จากโฟลเดอร์โปรเจกต์ ไม่ต้องแก้ Build settings
2. ที่ Project Settings > Environment Variables ตั้งค่า `ADMIN_USERNAME` และ `ADMIN_PASSWORD` (ใช้รหัสผ่านยาวและไม่ซ้ำกับที่อื่น)
3. ที่แท็บ Storage สร้าง Blob store แบบ Private แล้ว connect เข้ากับโปรเจกต์ Vercel จะเพิ่ม `BLOB_READ_WRITE_TOKEN` ให้อัตโนมัติ (ถ้าสร้างแบบ Public ให้ตั้ง `BLOB_ACCESS=public` เพิ่ม)
4. Redeploy หนึ่งครั้งเพื่อให้ค่า Environment Variables มีผล

ข้อควรรู้:

- เนื้อหาเริ่มต้นบน Vercel มาจาก `data/content.json` ที่ deploy ไปด้วย เมื่อกด `Save changes` ใน Admin ข้อมูลจะถูกเก็บใน Vercel Blob และใช้แทนไฟล์นี้
- หากยังไม่ได้ connect Blob store หน้าเว็บจะแสดงผลได้ตามปกติ แต่ Admin จะบันทึกไม่ได้
- Vercel จำกัดขนาด request ไว้ที่ 4.5 MB ดังนั้นเนื้อหาทั้งหมดรวมรูปและ PDF ที่อัปโหลดผ่าน Admin ต้องไม่เกินขนาดนี้ รูปขนาดใหญ่ควรวางใน `public/images/` แล้วอ้างอิงด้วย path แทน
- Session ของ Admin เป็น signed cookie อายุ 4 ชั่วโมง การเปลี่ยน `ADMIN_PASSWORD` จะทำให้ session เดิมใช้ไม่ได้ทันที
- การจำกัดจำนวนครั้งที่ล็อกอินผิดบน Vercel ทำงานแยกตาม function instance จึงไม่เข้มงวดเท่า `server.mjs`

## SEO

`npm run build` ทำสามขั้นตอน: build ฝั่ง client, build SSR bundle ชั่วคราว แล้วรัน `scripts/prerender.mjs` ซึ่งจะ

- render หน้า portfolio เป็น HTML ลงใน `dist/index.html` เพื่อให้ crawler ที่ไม่รัน JavaScript เห็นเนื้อหาจริง
- สร้าง title, description, canonical, Open Graph, Twitter Card และ JSON-LD (`Person`, `WebSite`, `ProfilePage`) จากเนื้อหาใน Admin
- สร้าง `robots.txt` และ `sitemap.xml`

URL หลักของเว็บมาจาก `SITE_URL` ถ้าไม่ได้ตั้งจะใช้โดเมน production ของ Vercel อัตโนมัติ **ถ้าใช้ custom domain ให้ตั้ง `SITE_URL=https://your-domain.com` ใน Environment Variables ของ Vercel** เมื่อ build ในเครื่องโดยไม่ตั้งค่านี้ canonical, `og:image` และ sitemap จะถูกข้าม

ข้อควรรู้:

- HTML และ meta tags ถูกสร้างตอน build หลังแก้เนื้อหาใน Admin ต้อง Redeploy เพื่อให้ส่วนนี้อัปเดต (ผู้เข้าชมเห็นเนื้อหาใหม่ทันทีตามปกติ)
- รูปที่ใช้ตอนแชร์ลิงก์คือ `public/og-image.jpg` (1200x630) หากเปลี่ยนชื่อหรือตำแหน่งงาน ควรทำรูปนี้ใหม่
- หน้า `/admin` ถูกตั้งเป็น `noindex`
- หลัง deploy ให้เพิ่มเว็บใน Google Search Console แล้ว submit `sitemap.xml`

## Build for production

```bash
npm run build
```

The production output is created in `dist/`.

To run the production build with authentication:

```bash
npm run start
```

Production server ใช้ค่าจาก `PORT` ใน `.env` (หากไม่กำหนดจะใช้ `3000`) สำหรับการ deploy จริงต้องใช้ HTTPS, ตั้ง `COOKIE_SECURE=true` และเก็บ `.env` เป็น secret เสมอ

### รันด้วย PM2 บน Linux

PM2 เหมาะสำหรับให้แอปทำงานต่อเนื่อง, restart เมื่อ process หยุดทำงาน และเริ่มอัตโนมัติหลังเครื่อง reboot

ติดตั้ง PM2 แบบ global หลังจากใช้ Node version ของโปรเจกต์แล้ว:

```bash
nvm use
npm install --global pm2
```
สร้าง production build และลบกับสร้าง node_modules ใหม่
```bash
rm -rf node_modules
npm ci
npm run build
```

สร้าง production build และเริ่มแอป:

```bash
pm2 start npm --name ai-portfolio -- run start
```

ตรวจสอบสถานะและ log:

```bash
pm2 status
pm2 logs ai-portfolio
```

ตั้งให้ PM2 เริ่มอัตโนมัติหลัง reboot (รันคำสั่งที่ PM2 แสดงผลต่อจาก `pm2 startup` ด้วย):

```bash
pm2 startup
pm2 save
```

หลังแก้ไขโค้ดและ build ใหม่ ให้ restart แอป:

```bash
npm run build
pm2 restart ai-portfolio
```

หยุดหรือลบ process:

```bash
pm2 stop ai-portfolio
pm2 delete ai-portfolio
```

## Project structure

```text
.
├── admin/                         # Admin route entry HTML
├── public/
│   ├── Resume.pdf                 # Downloadable resume
│   └── images/logos/              # Local technology brand SVGs
├── src/
│   ├── assets/projects/
│   │   ├── smartload-3d/          # SmartLoad gallery images
│   │   └── smart-warehouse-3d/    # Smart Warehouse gallery images
│   ├── App.jsx                    # Portfolio UI
│   ├── AdminApp.jsx               # Content-management UI
│   ├── content.js                 # Portfolio data and admin settings
│   ├── index.css                  # Tailwind and custom styles
│   └── main.jsx                   # Route selection and app entry
├── vite.config.js
└── package.json
```

## Updating content

Use `/admin/` to edit profile information, experience, education, skill groups, projects, certifications, and achievements in the browser.

For source-controlled default content, update `src/content.js`. Project images are grouped under `src/assets/projects/` and are imported from that file so Vite bundles them for production.

## License

This project is private and intended for the portfolio owner's use.
