/**
 * roblox-html-renderer — index.js
 *
 * Recebe HTML (qualquer coisa: texto, imagem, CSS, canvas, etc.)
 * Renderiza com Chromium headless via Puppeteer
 * Devolve os pixels RGBA em JSON compactado para o Roblox
 *
 * POST /render
 * Body JSON:
 *   {
 *     html:    string   — HTML completo a renderizar
 *     width:   number   — largura em px (padrão 200)
 *     height:  number   — altura em px (padrão 200)
 *     scale:   number   — deviceScaleFactor (padrão 1)
 *   }
 *
 * Resposta JSON:
 *   {
 *     width:  number
 *     height: number
 *     pixels: number[]  — array RGBA flat: [r,g,b,a, r,g,b,a, ...]
 *   }
 *
 * GET /health  →  { ok: true }
 */

const http = require("http");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

// ── Configurações ────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
const MAX_BODY = 5 * 1024 * 1024; // 5 MB de HTML no máximo
const MAX_W = 1920;
const MAX_H = 1080;

// ── Singleton do browser ─────────────────────────────────────────────────────

let browser = null;

async function getBrowser() {
  if (browser && browser.isConnected()) return browser;

  browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    defaultViewport: null,
  });

  browser.on("disconnected", () => {
    browser = null;
  });

  console.log("[browser] Chromium iniciado");
  return browser;
}

// ── Renderizador ─────────────────────────────────────────────────────────────

async function renderHTML(html, width, height, scale) {
  const b = await getBrowser();
  const page = await b.newPage();

  try {
    await page.setViewport({ width, height, deviceScaleFactor: scale });

    // Carrega o HTML diretamente (suporta <img>, <canvas>, <video poster>, CSS, SVG…)
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 15000 });

    // Screenshot em buffer PNG
    const pngBuffer = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width, height },
      omitBackground: false,
    });

    // Decodifica o PNG em pixels RGBA sem biblioteca externa
    // Usa a API nativa do Node 18+ via canvas-less trick: base64 → fetch API → ImageData
    // Como estamos no Node puro, usamos o próprio Chromium para extrair os pixels
    const pixelData = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = document.documentElement.scrollWidth || window.innerWidth;
      canvas.height = document.documentElement.scrollHeight || window.innerHeight;
      const ctx = canvas.getContext("2d");
      // Desenha o próprio body no canvas usando html2canvas-free approach
      // Retorna ImageData já que estamos dentro do browser
      ctx.drawImage(document.querySelector("canvas") || new Image(), 0, 0);
      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return Array.from(id.data);
    }).catch(() => null);

    // Fallback confiável: decodifica PNG via Chromium mesmo
    const rgba = await extractRGBAFromPNG(page, pngBuffer, width, height);

    return { width, height, pixels: rgba };
  } finally {
    await page.close();
  }
}

/**
 * Usa uma página em branco do Chromium para decodificar o PNG em RGBA
 * — sem depender de nenhuma lib nativa como 'canvas' ou 'sharp'
 */
async function extractRGBAFromPNG(page, pngBuffer, width, height) {
  const b64 = pngBuffer.toString("base64");

  const rgba = await page.evaluate(
    async ({ b64, width, height }) => {
      const blob = await fetch(`data:image/png;base64,${b64}`).then((r) =>
        r.blob()
      );
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0, width, height);
      const id = ctx.getImageData(0, 0, width, height);
      return Array.from(id.data); // RGBA flat array
    },
    { b64, width, height }
  );

  return rgba;
}

// ── HTTP Server ───────────────────────────────────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        req.destroy();
        return reject(new Error("Payload muito grande"));
      }
      data += chunk.toString();
    });

    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // Health check
  if (req.method === "GET" && req.url === "/health") {
    return send(res, 200, { ok: true, ts: Date.now() });
  }

  // Render endpoint
  if (req.method === "POST" && req.url === "/render") {
    let body;
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      return send(res, 400, { error: "JSON inválido no body" });
    }

    const html = body.html;
    if (typeof html !== "string" || html.trim().length === 0) {
      return send(res, 400, { error: "Campo 'html' obrigatório" });
    }

    const width = Math.min(Math.max(parseInt(body.width) || 200, 1), MAX_W);
    const height = Math.min(Math.max(parseInt(body.height) || 200, 1), MAX_H);
    const scale = Math.min(Math.max(parseFloat(body.scale) || 1, 0.5), 3);

    console.log(`[render] ${width}x${height} scale=${scale}`);

    try {
      const result = await renderHTML(html, width, height, scale);
      return send(res, 200, result);
    } catch (err) {
      console.error("[render] Erro:", err.message);
      return send(res, 500, { error: err.message });
    }
  }

  send(res, 404, { error: "Rota não encontrada" });
});

// ── Boot ─────────────────────────────────────────────────────────────────────

(async () => {
  // Pré-aquece o browser
  try {
    await getBrowser();
  } catch (e) {
    console.error("[boot] Falha ao iniciar Chromium:", e.message);
    process.exit(1);
  }

  server.listen(PORT, () => {
    console.log(`[server] Rodando em http://localhost:${PORT}`);
    console.log(`[server] POST /render  — envia HTML, recebe pixels RGBA`);
    console.log(`[server] GET  /health  — status`);
  });
})();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[server] Encerrando...");
  if (browser) await browser.close();
  server.close(() => process.exit(0));
});
