/**
 * BOTB Full-Site Advanced Crawler
 * --------------------------------
 * Features:
 * - Parallel crawling with concurrency pool
 * - Robust request interception (ads/analytics blocked)
 * - Automatic URL normalization
 * - Retry logic
 * - Structured metadata extraction
 * - JS-rendered content support
 * - Full HTML + screenshot archival
 * - Performance timing collection
 * - Intelligent queue, dedupe, throttling
 */

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

// CONFIG -------------------------

const START_URL = "https://www.botb.com";
const DOMAIN = "botb.com";

const MAX_PAGES = 300;
const MAX_DEPTH = 8;

const CONCURRENCY = 5;              // How many pages in parallel
const RETRIES = 3;

// OPTIMIZATION — block slow, useless requests
const BLOCKED_RESOURCE_TYPES = ["image", "media", "font", "stylesheet"];
const BLOCKED_URL_PATTERNS = [
    "googletagmanager",
    "google-analytics",
    "doubleclick",
    "facebook",
    "twitter",
    "hotjar",
    "optimizely",
    "segment",
    "tracking",
];

// --------------------------------

const OUTPUT_DIR = "data/botb";
const HTML_DIR = `${OUTPUT_DIR}/html`;
const SS_DIR = "screenshots/botb";

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(HTML_DIR, { recursive: true });
fs.mkdirSync(SS_DIR, { recursive: true });

// UTILS --------------------------

function normalizeUrl(url) {
    try {
        const u = new URL(url);
        if (!u.hostname.includes(DOMAIN)) return null;
        u.hash = ""; // remove fragment IDs
        return u.toString().replace(/\/$/, ""); // remove trailing slash
    } catch {
        return null;
    }
}

function sanitizeFilename(url) {
    return url
        .replace("https://", "")
        .replace("http://", "")
        .replace(/[^\w]+/g, "_")
        .substring(0, 70);
}

// --------------------------------

async function extractPageData(page, url, name) {
    console.log(`📄 Extracting: ${url}`);

    const metadata = await page.evaluate(() => {
        const get = (sel, attr = "content") =>
            document.querySelector(sel)?.getAttribute(attr) || "";

        const scripts = Array.from(document.querySelectorAll("script[type='application/ld+json']")).map(
            s => s.innerText
        );

        return {
            title: document.title || "",
            description: get("meta[name='description']"),
            canonical: get("link[rel='canonical']", "href"),
            keywords: get("meta[name='keywords']"),
            h1: Array.from(document.querySelectorAll("h1")).map(h => h.innerText.trim()),
            og: {
                title: get("meta[property='og:title']"),
                desc: get("meta[property='og:description']"),
                image: get("meta[property='og:image']")
            },
            twitter: {
                card: get("meta[name='twitter:card']"),
                title: get("meta[name='twitter:title']"),
                desc: get("meta[name='twitter:description']")
            },
            structuredDataRaw: scripts
        };
    });

    const performance = await page.evaluate(() => JSON.parse(JSON.stringify(window.performance.timing)));

    const text = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("body *"))
            .map(e => e.innerText)
            .filter(Boolean)
            .map(t => t.trim())
            .filter(t => t.length > 40)
            .slice(0, 250);
    });

    const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll("a[href]")).map(a => a.href)
    );

    const html = await page.content();
    fs.writeFileSync(`${HTML_DIR}/${name}.html`, html);

    try {
        await page.screenshot({ path: `${SS_DIR}/${name}.png`, fullPage: true });
    } catch (_) {}

    return { url, metadata, text, links, performance };
}

// --------------------------------

async function crawlPage(browser, task, visited, queue, results) {
    const { url, depth } = task;

    if (visited.has(url)) return;
    visited.add(url);

    let lastError = null;

    for (let attempt = 1; attempt <= RETRIES; attempt++) {
        try {
            const page = await browser.newPage();

            // Block junk requests
            await page.route("**/*", route => {
                const req = route.request();
                const type = req.resourceType();

                if (BLOCKED_RESOURCE_TYPES.includes(type)) return route.abort();
                if (BLOCKED_URL_PATTERNS.some(p => req.url().includes(p))) return route.abort();

                return route.continue();
            });

            await page.goto(url, { timeout: 70000, waitUntil: "domcontentloaded" });

            const name = sanitizeFilename(url);

            const data = await extractPageData(page, url, name);
            results[url] = data;

            let newLinks = data.links
                .map(normalizeUrl)
                .filter(Boolean)
                .filter(link => !visited.has(link));

            newLinks.forEach(link => {
                if (depth + 1 <= MAX_DEPTH && queue.length < MAX_PAGES) {
                    queue.push({ url: link, depth: depth + 1 });
                }
            });

            await page.close();
            return;

        } catch (err) {
            lastError = err.message;
            if (attempt < RETRIES) {
                console.log(`🔁 Retry ${attempt}/${RETRIES}: ${url}`);
            }
        }
    }

    results[url] = { url, error: lastError };
    console.log(`❌ Failed: ${url} — ${lastError}`);
}

// --------------------------------

async function run() {
    console.log("🚀 Starting advanced parallel crawler:", START_URL);

    const browser = await chromium.launch({ headless: true });

    const queue = [{ url: START_URL, depth: 0 }];
    const visited = new Set();
    const results = {};

    while (queue.length > 0 && visited.size < MAX_PAGES) {
        const batch = queue.splice(0, CONCURRENCY);

        await Promise.all(
            batch.map(task =>
                crawlPage(browser, task, visited, queue, results)
            )
        );
    }

    fs.writeFileSync(
        `${OUTPUT_DIR}/analysis.json`,
        JSON.stringify(
            {
                crawledAt: new Date().toISOString(),
                totalPages: visited.size,
                pages: results
            },
            null,
            2
        )
    );

    fs.writeFileSync(
        `${OUTPUT_DIR}/site-map.json`,
        JSON.stringify(
            {
                crawledAt: new Date().toISOString(),
                urls: [...visited]
            },
            null,
            2
        )
    );

    await browser.close();
    console.log(`✅ Crawl finished — ${visited.size} pages scraped.`);
}

run();
