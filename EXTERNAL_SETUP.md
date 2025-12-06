# External BOTB Discovery Setup

This file contains the code you need to run **outside of Lovable** to enable full Playwright-based scraping.

## Why External?

The BOTB website uses Angular (client-side rendering), so the competition URLs are loaded by JavaScript. Edge functions only see server-rendered HTML. You need Playwright to render the JavaScript and extract the URLs.

## Architecture

```
GitHub Actions (Daily) 
  → Playwright Crawler (renders BOTB pages)
    → Discovers URLs
      → Calls Lovable API endpoint (/ingest-discovered-urls)
        → Stores in Supabase
```

---

## 1. Playwright Crawler (Node.js)

Create a new folder `crawler/` in your project or a separate repo:

**crawler/package.json:**
```json
{
  "name": "botb-crawler",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "playwright": "^1.40.0",
    "node-fetch": "^3.3.1"
  }
}
```

**crawler/index.js:**
```javascript
// crawler/index.js
// Usage: SUPABASE_URL=... SUPABASE_ANON_KEY=... node index.js

import { chromium } from 'playwright';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

function normalize(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/+$/, '');
    return `${u.protocol}//${u.host}${path}`;
  } catch (e) {
    return null;
  }
}

async function submitUrls(urls) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/ingest-discovered-urls`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      urls,
      source: 'playwright-crawler',
      metadata: {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version
      }
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Submit failed: ${res.status} ${txt}`);
  }

  return res.json();
}

async function scrapeBotb() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  const pages = [
    'https://www.botb.com/prizes/cars',
    'https://www.botb.com/prizes/lifestyle',
    'https://www.botb.com/prizes/house'
  ];

  const allUrls = new Set();

  for (const url of pages) {
    console.log('Visiting', url);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      console.warn('page.goto failed:', e.message);
      continue;
    }

    // Click "Load more" buttons if present
    for (let i = 0; i < 10; i++) {
      const btn = await page.$(
        'button:has-text("Load more"), button:has-text("Show more"), button.load-more'
      );
      if (!btn) break;
      try {
        await btn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      } catch (e) {
        break;
      }
    }

    // Wait for prize links to be rendered
    try {
      await page.waitForSelector("a[href*='/prizes/']", { timeout: 15000 });
    } catch (e) {
      console.warn('Prize links not found on', url);
    }

    // Extract all anchors
    const anchors = await page.$$eval('a[href]', (els) =>
      els.map((e) => e.href).filter(Boolean)
    );

    for (const raw of anchors) {
      // Skip non-HTTP links
      if (/^(mailto:|tel:|javascript:)/.test(raw)) continue;

      let abs;
      try {
        abs = new URL(raw).toString();
      } catch {
        continue;
      }

      // Must be BOTB domain and prizes path
      if (!abs.includes('botb.com')) continue;
      if (!abs.includes('/prizes/')) continue;

      // Require at least /prizes/<slug> (2+ path segments)
      const parts = new URL(abs).pathname.split('/').filter(Boolean);
      if (parts.length < 2) continue;

      const n = normalize(abs);
      if (n) allUrls.add(n);
    }
  }

  await browser.close();
  return Array.from(allUrls);
}

async function run() {
  console.log('Starting BOTB scraper...');
  const urls = await scrapeBotb();
  console.log(`Discovered ${urls.length} URLs`);

  if (urls.length > 0) {
    const result = await submitUrls(urls);
    console.log('Submission result:', result);
  }

  console.log('Done');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

---

## 2. GitHub Actions Workflow

Create `.github/workflows/daily-botb-crawl.yml` in your repository:

```yaml
name: Daily BOTB Crawler

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: {}  # Allow manual trigger

jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd crawler
          npm ci

      - name: Install Playwright browsers
        run: |
          cd crawler
          npx playwright install --with-deps chromium

      - name: Run crawler
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: |
          cd crawler
          node index.js
```

**Required GitHub Secrets:**
- `SUPABASE_URL`: Your Supabase project URL (from .env)
- `SUPABASE_ANON_KEY`: Your Supabase anon key (from .env)

---

## 3. Setup Instructions

### Local Testing

1. Create the `crawler/` folder with the files above
2. Install dependencies:
   ```bash
   cd crawler
   npm install
   npx playwright install chromium
   ```
3. Set environment variables:
   ```bash
   export SUPABASE_URL="your-url"
   export SUPABASE_ANON_KEY="your-anon-key"
   ```
4. Run:
   ```bash
   node index.js
   ```

### GitHub Actions Setup

1. Add the files to your repository
2. Go to Repository Settings → Secrets and Variables → Actions
3. Add secrets:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Enable GitHub Actions
5. Manually trigger the workflow or wait for the scheduled run

---

## 4. Monitoring

- Check GitHub Actions logs for each run
- Check edge function logs in Lovable for ingest errors
- Check the Sync Monitor page in your app for discovered competitions

---

## 5. Optional: Deduplication

You can also run a dedupe job periodically. Create `dedupe/dedupe.js`:

```javascript
import Fuse from 'fuse.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: comps } = await supabase.from('competitions').select('*');
  const fuse = new Fuse(comps, { keys: ['title'], threshold: 0.2 });
  
  const merges = [];
  for (const c of comps) {
    const res = fuse.search(c.title).slice(0, 5);
    for (const r of res) {
      const candidate = r.item;
      if (candidate.id === c.id) continue;
      if (r.score < 0.12 && Math.abs(candidate.title.length - c.title.length) < 6) {
        merges.push({ from: candidate.id, into: c.id });
      }
    }
  }
  
  for (const m of merges) {
    await supabase
      .from('botb_mappings')
      .update({ competition_id: m.into })
      .eq('competition_id', m.from);
    await supabase.from('competitions').delete().eq('id', m.from);
  }
  
  console.log('Merges executed:', merges.length);
}

run().catch(console.error);
```

---

## Need Help?

If you have issues:
1. Check GitHub Actions logs for crawler errors
2. Check edge function logs in Lovable for API errors
3. Verify your Supabase URL and keys are correct
4. Test the crawler locally first before setting up GitHub Actions
