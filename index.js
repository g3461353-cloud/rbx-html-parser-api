const express = require('express');
const { createCanvas } = require('canvas');
const { JSDOM, ResourceLoader } = require('jsdom');
const app = express();

const WIDTH = 32; 
const HEIGHT = 32;

let systemLogs = {
    status: "Inicializando scripts...",
    progress: 0,
    engineActive: false,
    filesLoaded: 0,
    totalFiles: 4, // playcanvas, game-scripts, start, loading
    error: "Nenhum"
};

const serverCanvas = createCanvas(WIDTH, HEIGHT);
const serverCtx = serverCanvas.getContext('2d');

class QuickLoader extends ResourceLoader {
    fetch(url, options) {
        return super.fetch(url, options).then(res => {
            systemLogs.filesLoaded++;
            systemLogs.progress = Math.floor((systemLogs.filesLoaded / systemLogs.totalFiles) * 100);
            return res;
        });
    }
}

const dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="application-canvas"></canvas></body></html>`, {
    runScripts: "dangerously", // Permite execução imediata
    resources: new QuickLoader(),
    pretendToBeVisual: true
});

const { window } = dom;

// Mock de WebGL para Canvas 2D
window.HTMLCanvasElement.prototype.getContext = function(type) {
    systemLogs.engineActive = true;
    systemLogs.status = "Motor Rodando";
    return serverCtx;
};

// Rota de Renderização
app.get('/render', (req, res) => {
    const imageData = serverCtx.getImageData(0, 0, WIDTH, HEIGHT).data;
    const pixels = Array.from(imageData).filter((_, i) => (i + 1) % 4 !== 0);

    res.json({
        data: pixels,
        logs: systemLogs
    });
});

app.listen(process.env.PORT || 3000);
