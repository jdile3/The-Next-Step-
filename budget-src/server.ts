import express from 'express';
import { createServer as createViteServer, build as viteBuild } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import JSZip from 'jszip';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureDistBuilt(): Promise<string> {
  const distDir = path.resolve(__dirname, 'dist');
  await viteBuild({ root: __dirname });
  return distDir;
}

export async function generateStandaloneBudgetHtml(): Promise<string> {
  const distDir = await ensureDistBuilt();
  const assetsDir = path.join(distDir, 'assets');
  const assetFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];

  const cssFile = assetFiles.find((f) => f.endsWith('.css'));
  const jsFile = assetFiles.find((f) => f.endsWith('.js'));

  const cssContent = cssFile ? fs.readFileSync(path.join(assetsDir, cssFile), 'utf8') : '';
  let jsContent = jsFile ? fs.readFileSync(path.join(assetsDir, jsFile), 'utf8') : '';

  // Inline the compact 192px logo (45 KB) as a base64 Data URI so budget.html stays fast and needs zero image subfolders
  const iconPath = path.resolve(__dirname, 'public/icon-192.png');
  const iconDataUri = fs.existsSync(iconPath)
    ? `data:image/png;base64,${fs.readFileSync(iconPath).toString('base64')}`
    : '';

  if (iconDataUri) {
    jsContent = jsContent.replace(
      /(\.?\/)?assets\/aistudio\/The_Next_Step_Logo_Engraved_a3596208\.png/g,
      iconDataUri
    );
  }

  // Safely escape closing script tags inside JS string literals
  const safeJsContent = jsContent.replace(/<\/script/gi, '<\\/script');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>The Next Step - Budgeting</title>
    <meta name="description" content="A Budgeting APP to help through your life's journey. Protect essentials first. The rest is yours to decide." />
    <meta name="theme-color" content="#061629" />
    <meta name="mobile-web-app-capable" content="yes" />
    <link rel="icon" type="image/png" sizes="192x192" href="./icon-192.png" />
    <link rel="apple-touch-icon" href="./icon-192.png" />
    <link rel="manifest" href="./manifest.json" />
    <script>
      (function () {
        function syncScreenScale() {
          var w = window.innerWidth || document.documentElement.clientWidth || 390;
          var h = window.innerHeight || document.documentElement.clientHeight || 844;
          var isPortrait = h > w * 1.12;
          var isLargeMode = document.documentElement.classList.contains("large");
          var mult = isLargeMode ? 1.15 : 1;
          if (isPortrait) {
            var widthScale = (w / 382) * 16.5;
            var heightScale = (h / 810) * 16.8;
            var basePx = Math.max(16, Math.min(widthScale, heightScale * 1.08));
            document.documentElement.style.fontSize = (basePx * mult).toFixed(2) + "px";
          } else {
            document.documentElement.style.fontSize = isLargeMode ? "19px" : "16px";
          }
        }
        syncScreenScale();
        window.addEventListener("resize", syncScreenScale);
        window.addEventListener("orientationchange", syncScreenScale);
        window.__TNS_SYNC_SCALE__ = syncScreenScale;
      })();
    </script>
    <!-- ==========================================================================
         EASY EDIT CONFIG (EDIT YOUR LINKS HERE OR IN ads-and-links.js!)
         ========================================================================== -->
    <script>
      window.TNS_MONETIZATION_CONFIG = {
        // 1. Your Stripe Payment Link (Paste your Stripe checkout URL inside the quotes when ready)
        STRIPE_PAYMENT_LINK_URL: "https://buy.stripe.com/3cIfZiaWi0MYaBz8YNfjG00",

        // 2. Your Live Website URL (Optional: Paste your GitHub Pages or domain URL here)
        OFFICIAL_WEBSITE_URL: "https://jdile3.github.io/The-Next-Step-/",

        // 3. Google AdSense (Optional: Set enabled to true and paste your IDs when ready)
        ADSENSE_CONFIG: {
          enabled: false,
          publisherId: "ca-pub-0000000000000000",
          bannerSlotId: "0000000000"
        },

        // 4. Rotating Banner Ads (Paste your referral or sponsor links inside ctaUrl: "")
        SPONSOR_BANNERS: [
          {
            id: "sponsor-cashback-gas",
            tag: "Featured Partner",
            title: "Save Up to 25¢/Gal on Gas & Groceries",
            description: "Earn automatic cash back at Shell, Circle K, Speedway, and local grocery stores.",
            ctaText: "Claim Free Bonus",
            ctaUrl: "" // <-- PASTE YOUR REFERRAL OR SPONSOR LINK HERE
          },
          {
            id: "sponsor-high-yield",
            tag: "Smart Money Partner",
            title: "Stop Getting Paid 0.01% by Your Bank",
            description: "Get paid up to 2 days early with zero monthly maintenance or overdraft fees.",
            ctaText: "Learn More",
            ctaUrl: "" // <-- PASTE YOUR REFERRAL OR SPONSOR LINK HERE
          },
          {
            id: "sponsor-tns-pro",
            tag: "The Next Step Pro",
            title: "Remove All Ads & Unlock Unlimited Accounts",
            description: "One-time $6.99 lifetime unlock. Zero monthly subscriptions. 100% private.",
            ctaText: "Unlock Pro",
            ctaUrl: "INTERNAL_UPGRADE"
          }
        ],

        // 5. Post-Trial (Day 31+) 5-Second Commercial Break Ad
        VIDEO_AD_CONFIG: {
          id: "video-ad-post-trial",
          enabled: true,
          sponsorName: "The Next Step · Sponsored Message",
          headline: "Your 30-Day Free Trial Has Ended",
          subheadline: "You are currently using the ad-supported Free Tier (2 accounts max). Watch this 5-second message to continue for free, or unlock Lifetime Pro to remove all video & banner ads forever.",
          bullets: [
            "Unlimited Checking, Savings, Cash App & Card Accounts",
            "Full Recurring Bill Calendar, Goals & Reality Check Mirror",
            "100% Ad-Free Forever — Zero Monthly Subscriptions"
          ],
          videoMp4Url: "", // <-- Optional: paste a direct .mp4 video ad link here
          ctaText: "Remove All Ads Forever",
          ctaUrl: "INTERNAL_UPGRADE", // <-- Or paste a sponsor link here
          skipDelaySeconds: 5,
          cooldownMinutes: 4
        }
      };
    </script>
    <script src="./ads-and-links.js"></script>
    <meta property="og:title" content="The Next Step - Budgeting" />
    <meta property="og:description" content="A Budgeting APP to help through your life's journey. Protect essentials first. The rest is yours to decide." />
    <meta property="og:type" content="website" />
    <style>${cssContent}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${safeJsContent}</script>
  </body>
</html>`;
}

function resolveServerPort(): number {
  const portArgIdx = process.argv.findIndex((arg) => arg === '--port' || arg === '-p');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    const cliPort = Number(process.argv[portArgIdx + 1]);
    if (Number.isFinite(cliPort) && cliPort > 0) return cliPort;
  }
  const inlineArg = process.argv.find((arg) => arg.startsWith('--port='));
  if (inlineArg) {
    const cliPort = Number(inlineArg.slice('--port='.length));
    if (Number.isFinite(cliPort) && cliPort > 0) return cliPort;
  }
  const envPort = Number(process.env.PORT);
  const nginxPort = Number(process.env.NGINX_PORT);
  if (Number.isFinite(envPort) && envPort > 0 && envPort !== nginxPort) {
    return envPort;
  }
  return Number(process.env.DEFAULT_APP_PORT) || 3000;
}

async function startServer() {
  const app = express();
  const PORT = resolveServerPort();
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  app.get('/api/status', (_req, res) => {
    res.json({
      status: 'online',
      appName: 'THE NEXT STEP: BUDGETING',
      mode: '100% Local / Zero Cloud API Billing',
      cloudApiUsed: false,
    });
  });

  app.post('/api/scan-receipt', (_req, res) => {
    res.status(503).json({ error: 'Local OCR fallback active' });
  });

  function buildHtmlWithEmbeddedLogos(fileName: string): string {
    const filePath = path.resolve(__dirname, fileName);
    let content = fs.readFileSync(filePath, 'utf8');

    const logoMap: Array<[RegExp, string, string]> = [
      [/\.\/logo-master\.jpg/g, 'public/logo-master.jpg', 'image/jpeg'],
      [/\.\/logo-money\.png/g, 'public/logo-money.png', 'image/png'],
      [/\.\/logo-iron\.jpg/g, 'public/logo-iron.jpg', 'image/jpeg'],
      [/\.\/logo-housing\.jpg/g, 'public/logo-housing.jpg', 'image/jpeg'],
      [/\.\/logo-recovery\.jpg/g, 'public/logo-recovery.jpg', 'image/jpeg'],
      [/\.\/logo-unhoused\.jpg/g, 'public/logo-unhoused.jpg', 'image/jpeg'],
    ];

    for (const [pattern, relPath, mime] of logoMap) {
      const fullPath = path.resolve(__dirname, relPath);
      if (fs.existsSync(fullPath)) {
        const dataUri = `data:${mime};base64,${fs.readFileSync(fullPath).toString('base64')}`;
        content = content.replace(pattern, dataUri);
      }
    }

    const hrDataPath = path.resolve(__dirname, 'public/harm-reduction-data.js');
    if (fs.existsSync(hrDataPath)) {
      const hrDataJs = fs.readFileSync(hrDataPath, 'utf8');
      content = content.replace(
        '<script src="./harm-reduction-data.js"></script>',
        `<script>${hrDataJs}</script>`
      );
    }

    const hrUiPath = path.resolve(__dirname, 'public/harm-reduction-ui.js');
    if (fs.existsSync(hrUiPath)) {
      const hrUiJs = fs.readFileSync(hrUiPath, 'utf8');
      content = content.replace(
        '<script src="./harm-reduction-ui.js"></script>',
        `<script>${hrUiJs}</script>`
      );
    }

    return content;
  }

  function buildWebsiteHtmlWithEmbeddedLogos(): string {
    return buildHtmlWithEmbeddedLogos('website-landing.html');
  }

  // Live Preview of Main Website inside AI Studio
  app.get('/website-preview', (_req, res) => {
    try {
      const landingPath = path.resolve(__dirname, 'website-landing.html');
      const content = fs.readFileSync(landingPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(content);
    } catch (err) {
      console.error('Error serving website preview:', err);
      res.status(500).send('Failed to preview website');
    }
  });

  // Live Preview of Harm Reduction Page inside AI Studio
  app.get('/harm-reduction.html', (_req, res) => {
    try {
      const hrPath = path.resolve(__dirname, 'harm-reduction.html');
      const content = fs.readFileSync(hrPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(content);
    } catch (err) {
      console.error('Error serving harm-reduction.html:', err);
      res.status(500).send('Failed to preview harm-reduction.html');
    }
  });

  // Route 1: Download Standalone Main Website (index.html with all logos embedded)
  app.get('/api/download-website-index', (_req, res) => {
    try {
      const content = buildWebsiteHtmlWithEmbeddedLogos();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="index.html"');
      res.send(content);
    } catch (err) {
      console.error('Error serving website index.html:', err);
      res.status(500).send('Failed to generate index.html');
    }
  });

  // Route 1B: Download Standalone Harm Reduction Page (harm-reduction.html with logos embedded)
  app.get('/api/download-harm-reduction', (_req, res) => {
    try {
      const content = buildHtmlWithEmbeddedLogos('harm-reduction.html');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="harm-reduction.html"');
      res.send(content);
    } catch (err) {
      console.error('Error serving harm-reduction.html:', err);
      res.status(500).send('Failed to generate harm-reduction.html');
    }
  });

  // Route 2: Download 100% Self-Contained Single-File Budgeting App (budget.html)
  app.get('/api/download-budget-single-html', async (_req, res) => {
    try {
      const html = await generateStandaloneBudgetHtml();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="budget.html"');
      res.send(html);
    } catch (err) {
      console.error('Error generating standalone budget.html:', err);
      res.status(500).send('Failed to generate budget.html');
    }
  });

  // Route 3: Download Easy Edit Config File (ads-and-links.js)
  app.get('/api/download-ads-config', (_req, res) => {
    try {
      const cfgPath = path.resolve(__dirname, 'public/ads-and-links.js');
      const content = fs.readFileSync(cfgPath, 'utf8');
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="ads-and-links.js"');
      res.send(content);
    } catch (err) {
      console.error('Error serving ads-and-links.js:', err);
      res.status(500).send('Failed to serve ads-and-links.js');
    }
  });

  // Route 4: 1-Click Download of Complete Flat-Root GitHub Pages Bundle (.ZIP)
  app.get('/api/download-github-pages-zip', async (_req, res) => {
    try {
      const standaloneBudgetHtml = await generateStandaloneBudgetHtml();
      const zip = new JSZip();

      zip.file('index.html', buildWebsiteHtmlWithEmbeddedLogos());
      zip.file('harm-reduction.html', buildHtmlWithEmbeddedLogos('harm-reduction.html'));
      zip.file('budget.html', standaloneBudgetHtml);

      const rootCompanionFiles = [
        'ads-and-links.js',
        'manifest.json',
        'sw.js',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
        'logo-master.jpg',
        'logo-money.png',
        'logo-iron.jpg',
        'logo-housing.jpg',
        'logo-recovery.jpg',
        'logo-unhoused.jpg',
      ];

      for (const fileName of rootCompanionFiles) {
        const filePath = path.resolve(__dirname, 'public', fileName);
        if (fs.existsSync(filePath)) {
          zip.file(fileName, fs.readFileSync(filePath));
        }
      }

      zip.file('.nojekyll', '');

      const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Length', String(buffer.length));
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="the-next-step-github-flat-bundle.zip"'
      );
      res.send(buffer);
    } catch (err) {
      console.error('Error generating GitHub Pages zip:', err);
      res.status(500).send('Failed to generate GitHub Pages ZIP');
    }
  });

  // Route 4B: Download Complete Source Code, Public Assets, Docs & System Instructions (.ZIP)
  app.get('/api/download-complete-project-zip', async (_req, res) => {
    try {
      const zip = new JSZip();
      const skipDirs = new Set(['node_modules', 'dist', '.git', '.aistudio', 'images']);
      const skipFiles = new Set([
        'budget-app-complete-backup.zip',
        'logo-master-arch-name.jpg',
        'logo-master-arch-runes.jpg',
        'logo-master-clasp.jpg',
      ]);

      const addDirRecursive = (dirPath: string, zipPrefix: string) => {
        if (!fs.existsSync(dirPath)) return;
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            if (!skipDirs.has(entry.name)) {
              addDirRecursive(
                path.join(dirPath, entry.name),
                zipPrefix ? `${zipPrefix}/${entry.name}` : entry.name
              );
            }
          } else if (entry.isFile()) {
            if (
              skipFiles.has(entry.name) ||
              entry.name.startsWith('Screenshot_') ||
              entry.name.startsWith('master-opt-')
            ) {
              continue;
            }
            const fullPath = path.join(dirPath, entry.name);
            const targetPath = zipPrefix ? `${zipPrefix}/${entry.name}` : entry.name;
            zip.file(targetPath, fs.readFileSync(fullPath));
          }
        }
      };

      const rootFiles = [
        '.env.example',
        '.gitignore',
        'package.json',
        'bun.lock',
        'tsconfig.json',
        'vite.config.ts',
        'metadata.json',
        'server.ts',
        'index.html',
        'website-landing.html',
        'harm-reduction.html',
        'README.md',
        'AI_WELCOME_PACKET.md',
        'THE_NEXT_STEP_MANIFESTO_AND_VISION.md',
        'THE_NEXT_STEP_SYSTEM_INSTRUCTIONS.md',
      ];

      for (const fileName of rootFiles) {
        const fullPath = path.resolve(__dirname, fileName);
        if (fs.existsSync(fullPath)) {
          zip.file(fileName, fs.readFileSync(fullPath));
        }
      }

      addDirRecursive(path.resolve(__dirname, 'src'), 'src');
      addDirRecursive(path.resolve(__dirname, 'public'), 'public');

      const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Length', String(buffer.length));
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="the-next-step-complete-source-and-docs.zip"'
      );
      res.send(buffer);
    } catch (err) {
      console.error('Error generating complete project zip:', err);
      res.status(500).send('Failed to generate Complete Project ZIP');
    }
  });

  // Live JSON endpoint for on-screen Preview Modal (no ZIP required!)
  app.get('/api/founder-docs', (_req, res) => {
    try {
      const readDoc = (name: string) => {
        const p = path.resolve(__dirname, name);
        return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
      };
      res.json({
        welcomePacket: readDoc('AI_WELCOME_PACKET.md'),
        visionDoc: readDoc('THE_NEXT_STEP_MANIFESTO_AND_VISION.md'),
        readmeDoc: readDoc('README.md'),
      });
    } catch (err) {
      console.error('Error reading founder docs:', err);
      res.status(500).json({ error: 'Failed to load docs' });
    }
  });

  // Route 5: 1-Click Download of All Ecosystem Logos + Welcome Packet (.ZIP)
  app.get('/api/download-social-media-pack-zip', async (_req, res) => {
    try {
      const zip = new JSZip();

      for (const docName of [
        'README.md',
        'AI_WELCOME_PACKET.md',
        'THE_NEXT_STEP_MANIFESTO_AND_VISION.md',
        'THE_NEXT_STEP_SYSTEM_INSTRUCTIONS.md',
      ]) {
        const docPath = path.resolve(__dirname, docName);
        if (fs.existsSync(docPath)) {
          const text = fs.readFileSync(docPath, 'utf8');
          zip.file(docName, text);
          zip.file(docName.replace(/\.md$/, '.txt'), text);
        }
      }

      const logoFiles: Array<[string, string]> = [
        [
          '0_The_Next_Step_Master_Logo_Hands_And_Runes.jpg',
          'public/assets/logos/the_next_step_master_logo.jpg',
        ],
        [
          '0B_The_Next_Step_Master_Logo_Hands_Clean.jpg',
          'public/assets/logos/the_next_step_master_logo_no_runes.jpg',
        ],
        ['1_The_Next_Step_Money_Logo.png', 'public/assets/logos/the_next_step_money_logo.png'],
        ['2_The_Next_Step_Iron_Gym_Logo.jpg', 'public/assets/logos/the_next_step_iron_gym_logo.jpg'],
        [
          '3_The_Next_Step_Housing_Keys_Logo.jpg',
          'public/assets/logos/the_next_step_housing_logo.jpg',
        ],
        [
          '4_The_Next_Step_Recovery_Shield_Logo.jpg',
          'public/assets/logos/the_next_step_recovery_logo.jpg',
        ],
        [
          '5_The_Next_Step_Unhoused_Tent_Logo.jpg',
          'public/assets/logos/the_next_step_unhoused_logo.jpg',
        ],
      ];

      for (const [zipName, relPath] of logoFiles) {
        const fullPath = path.resolve(__dirname, relPath);
        if (fs.existsSync(fullPath)) {
          zip.file(zipName, fs.readFileSync(fullPath));
        }
      }

      const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Length', String(buffer.length));
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="the-next-step-social-media-and-logos.zip"'
      );
      res.send(buffer);
    } catch (err) {
      console.error('Error generating Social Media Pack zip:', err);
      res.status(500).send('Failed to generate Social Media Pack ZIP');
    }
  });

  app.use(
    express.static(path.resolve(__dirname, 'public'), {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('sw.js')) {
          res.setHeader('Service-Worker-Allowed', '/');
          res.setHeader('Content-Type', 'application/javascript');
        }
      },
    })
  );

  app.get('/budget.html', (_req, res) => {
    res.redirect('/');
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `THE NEXT STEP app server running on http://0.0.0.0:${PORT} (Zero Cloud API Mode)`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
