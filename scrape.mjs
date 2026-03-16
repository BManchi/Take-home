import { parse } from 'node-html-parser';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://help.copilot.money';
const DELAY_MS = 500;

const COLLECTIONS = [
  { name: 'dashboard',    url: 'https://help.copilot.money/en/collections/3377751-dashboard' },
  { name: 'accounts',     url: 'https://help.copilot.money/en/collections/2343791-accounts' },
  { name: 'categories',   url: 'https://help.copilot.money/en/collections/2199956-categories' },
  { name: 'transactions', url: 'https://help.copilot.money/en/collections/3194194-transactions' },
  { name: 'recurrings',   url: 'https://help.copilot.money/en/collections/2199953-recurrings' },
  { name: 'cash-flow',    url: 'https://help.copilot.money/en/collections/10261166-cash-flow' },
  { name: 'investments',  url: 'https://help.copilot.money/en/collections/3136877-investments' },
  { name: 'goals',        url: 'https://help.copilot.money/en/collections/12508175-goals' },
  { name: 'widgets',      url: 'https://help.copilot.money/en/collections/2832266-widgets' },
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`  Retry ${i + 1}/${retries} for ${url}`);
      await delay(1000 * (i + 1));
    }
  }
}

async function fetchText(url) {
  const res = await fetchWithRetry(url);
  return res.text();
}

async function downloadImage(url, destPath) {
  try {
    const res = await fetchWithRetry(url);
    const buffer = await res.arrayBuffer();
    writeFileSync(destPath, Buffer.from(buffer));
    return true;
  } catch (e) {
    console.warn(`  Failed to download image: ${url} — ${e.message}`);
    return false;
  }
}

function getArticleLinks(html) {
  const root = parse(html);
  const links = new Set();
  // Intercom article links: /en/articles/...
  root.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.match(/\/en\/articles\/\d+/)) {
      const full = href.startsWith('http') ? href : BASE_URL + href;
      // Strip hash fragments
      links.add(full.split('#')[0]);
    }
  });
  return [...links];
}

// Convert an Intercom article HTML node to clean markdown
function htmlToMarkdown(node, imageMap = {}) {
  if (!node) return '';

  function processNode(n) {
    const tag = n.tagName ? n.tagName.toLowerCase() : null;

    if (!tag) {
      // Text node
      return n.text || '';
    }

    const inner = () => n.childNodes.map(processNode).join('');

    switch (tag) {
      case 'h1': return `\n# ${inner().trim()}\n\n`;
      case 'h2': return `\n## ${inner().trim()}\n\n`;
      case 'h3': return `\n### ${inner().trim()}\n\n`;
      case 'h4': return `\n#### ${inner().trim()}\n\n`;
      case 'h5': return `\n##### ${inner().trim()}\n\n`;
      case 'h6': return `\n###### ${inner().trim()}\n\n`;
      case 'p': {
        const text = inner().trim();
        return text ? `\n${text}\n` : '';
      }
      case 'br': return '\n';
      case 'hr': return '\n---\n';
      case 'strong':
      case 'b': {
        const text = inner().trim();
        return text ? `**${text}**` : '';
      }
      case 'em':
      case 'i': {
        const text = inner().trim();
        return text ? `*${text}*` : '';
      }
      case 'code': return `\`${inner()}\``;
      case 'pre': return `\n\`\`\`\n${n.text}\n\`\`\`\n`;
      case 'a': {
        const href = n.getAttribute('href') || '';
        const text = inner().trim();
        if (!text) return '';
        if (!href || href === '#') return text;
        return `[${text}](${href})`;
      }
      case 'img': {
        const src = n.getAttribute('src') || '';
        const alt = n.getAttribute('alt') || 'screenshot';
        const localPath = imageMap[src];
        if (localPath) return `\n![${alt}](${localPath})\n`;
        return src ? `\n![${alt}](${src})\n` : '';
      }
      case 'ul': {
        const items = n.querySelectorAll(':scope > li').map(li => {
          return `- ${processNode(li).trim()}`;
        });
        return items.length ? `\n${items.join('\n')}\n` : '';
      }
      case 'ol': {
        const items = n.querySelectorAll(':scope > li').map((li, i) => {
          return `${i + 1}. ${processNode(li).trim()}`;
        });
        return items.length ? `\n${items.join('\n')}\n` : '';
      }
      case 'li': return inner();
      case 'blockquote': return `\n> ${inner().trim()}\n`;
      case 'table': {
        // Simple table rendering
        const rows = n.querySelectorAll('tr');
        if (!rows.length) return inner();
        const lines = rows.map((row, idx) => {
          const cells = row.querySelectorAll('th, td').map(cell => cell.text.trim());
          const line = `| ${cells.join(' | ')} |`;
          if (idx === 0) {
            const sep = `| ${cells.map(() => '---').join(' | ')} |`;
            return `${line}\n${sep}`;
          }
          return line;
        });
        return `\n${lines.join('\n')}\n`;
      }
      case 'div':
      case 'section':
      case 'article':
      case 'span':
      case 'figure':
      case 'figcaption':
        return inner();
      // Skip purely decorative/structural elements
      case 'script':
      case 'style':
      case 'noscript':
      case 'nav':
      case 'header':
      case 'footer':
        return '';
      default:
        return inner();
    }
  }

  return processNode(node);
}

function cleanMarkdown(md) {
  return md
    .replace(/\n{3,}/g, '\n\n')   // collapse 3+ blank lines
    .replace(/[ \t]+\n/g, '\n')    // trailing spaces
    .trim();
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getImageFilename(url, index) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    const rawName = parts[parts.length - 1];
    // Add index prefix to avoid collisions
    return `${String(index).padStart(2, '0')}-${rawName}`;
  } catch {
    return `image-${index}.png`;
  }
}

async function scrapeArticle(articleUrl, collectionName, screenshotsDir) {
  const html = await fetchText(articleUrl);
  const root = parse(html);

  // Title
  const titleEl = root.querySelector('h1') || root.querySelector('[itemprop="name"]') || root.querySelector('.article-title');
  const title = titleEl ? titleEl.text.trim() : articleUrl.split('/').pop().replace(/-/g, ' ');

  // Article body — Intercom uses .intercom-interblocks-article or article element
  const bodyEl =
    root.querySelector('.intercom-interblocks-article') ||
    root.querySelector('article .article__body') ||
    root.querySelector('[class*="article-body"]') ||
    root.querySelector('article') ||
    root.querySelector('main');

  if (!bodyEl) {
    console.warn(`  No article body found for: ${articleUrl}`);
    return { title, markdown: `# ${title}\n\n*No content extracted.*\n`, images: [] };
  }

  // Collect image URLs from body
  const imgEls = bodyEl.querySelectorAll('img');
  const imageMap = {}; // originalSrc -> relative markdown path
  const imageDownloads = []; // { src, destPath, localPath }

  imgEls.forEach((img, idx) => {
    const src = img.getAttribute('src');
    if (!src || !src.includes('intercomcdn.com')) return;
    const filename = getImageFilename(src, idx + 1);
    const destPath = join(screenshotsDir, filename);
    const localPath = `../../screenshots/${collectionName}/${filename}`;
    imageMap[src] = localPath;
    imageDownloads.push({ src, destPath, localPath });
  });

  // Download images
  for (const { src, destPath } of imageDownloads) {
    if (!existsSync(destPath)) {
      await downloadImage(src, destPath);
      await delay(200);
    }
  }

  // Convert body to markdown
  const rawMd = htmlToMarkdown(bodyEl, imageMap);
  const markdown = `# ${title}\n\n**Source:** ${articleUrl}\n\n${cleanMarkdown(rawMd)}\n`;

  return {
    title,
    markdown,
    images: imageDownloads.map(d => d.localPath),
  };
}

async function scrapeCollection(collection) {
  console.log(`\n=== Collection: ${collection.name} ===`);

  const collectionDir = join(__dirname, 'docs', 'help-center', collection.name);
  const screenshotsDir = join(__dirname, 'docs', 'screenshots', collection.name);
  mkdirSync(collectionDir, { recursive: true });
  mkdirSync(screenshotsDir, { recursive: true });

  const html = await fetchText(collection.url);
  const articleUrls = getArticleLinks(html);
  console.log(`  Found ${articleUrls.length} articles`);

  const articles = [];

  for (const url of articleUrls) {
    const slug = url.split('/').pop();
    console.log(`  Fetching: ${slug}`);

    try {
      const article = await scrapeArticle(url, collection.name, screenshotsDir);
      const filename = `${slug}.md`;
      const filePath = join(collectionDir, filename);
      writeFileSync(filePath, article.markdown, 'utf8');
      articles.push({
        title: article.title,
        url,
        file: `${collection.name}/${filename}`,
        images: article.images,
      });
      console.log(`    ✓ Saved: ${filename} (${article.images.length} images)`);
    } catch (e) {
      console.error(`    ✗ Failed: ${slug} — ${e.message}`);
    }

    await delay(DELAY_MS);
  }

  return articles;
}

async function main() {
  console.log('Starting Copilot Money help center scrape...\n');

  const docsDir = join(__dirname, 'docs', 'help-center');
  mkdirSync(docsDir, { recursive: true });

  const index = {}; // collectionName -> articles[]

  for (const collection of COLLECTIONS) {
    const articles = await scrapeCollection(collection);
    index[collection.name] = articles;
  }

  // Write INDEX.md
  let indexMd = `# Copilot Money Help Center — Index\n\n`;
  indexMd += `*Scraped on ${new Date().toISOString().split('T')[0]}*\n\n`;
  indexMd += `---\n\n`;

  for (const collection of COLLECTIONS) {
    const articles = index[collection.name] || [];
    const collName = collection.name.charAt(0).toUpperCase() + collection.name.slice(1);
    indexMd += `## ${collName} (${articles.length} articles)\n\n`;
    for (const art of articles) {
      indexMd += `- [${art.title}](${art.file})`;
      if (art.images.length > 0) {
        indexMd += ` — ${art.images.length} screenshot${art.images.length > 1 ? 's' : ''}`;
      }
      indexMd += `\n`;
    }
    indexMd += `\n`;
  }

  const totalArticles = Object.values(index).reduce((sum, arr) => sum + arr.length, 0);
  const totalImages = Object.values(index).flat().reduce((sum, a) => sum + a.images.length, 0);
  indexMd += `---\n\n*Total: ${totalArticles} articles, ${totalImages} screenshots*\n`;

  writeFileSync(join(docsDir, 'INDEX.md'), indexMd, 'utf8');
  console.log(`\nDone! INDEX.md written.`);
  console.log(`Total articles: ${totalArticles}, Total images: ${totalImages}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
