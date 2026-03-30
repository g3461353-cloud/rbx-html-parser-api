const express = require('express');
const { createCanvas } = require('canvas');
const { JSDOM, ResourceLoader } = require('jsdom');
const app = express();

const WIDTH = 32; 
const HEIGHT = 32;

let systemLogs = {
    status: "Iniciando...",
    downloads: {},
    error: "Nenhum",
    engineActive: false,
    frames: 0
};

// Monitor de Recursos (Download)
class CustomLoader extends ResourceLoader {
    fetch(url, options) {
        const fileName = url.split('/').pop();
        systemLogs.downloads[fileName] = "Baixando...";
        systemLogs.status = `Baixando recurso: ${fileName}`;
        
        return super.fetch(url, options).then(res => {
            systemLogs.downloads[fileName] = "OK";
            return res;
        }).catch(err => {
            systemLogs.downloads[fileName] = "ERRO";
            systemLogs.error = `Falha ao baixar ${fileName}`;
            return null;
        });
    }
}

const serverCanvas = createCanvas(WIDTH, HEIGHT);
const serverCtx = serverCanvas.getContext('2d');

// Injeção do JSDOM
const dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="application-canvas"></canvas></body></html>`, {
    runScripts: "dangerously",
    resources: new CustomLoader(),
    pretendToBeVisual: true
});

const { window } = dom;

// Simulação de WebGL (Redireciona para o Canvas 2D do Node)
window.HTMLCanvasElement.prototype.getContext = function(type) {
    if (type.includes("webgl")) {
        systemLogs.engineActive = true;
        systemLogs.status = "Motor WebGL Simulado Ativo";
        return serverCtx;
    }
    return serverCtx;
};

app.get('/render', (req, res) => {
    systemLogs.frames++;
    
    const imageData = serverCtx.getImageData(0, 0, WIDTH, HEIGHT).data;
    const pixels = Array.from(imageData).filter((_, i) => (i + 1) % 4 !== 0); // Remove Alpha

    res.json({
        data: pixels,
        logs: systemLogs
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("API de Diagnóstico Online");
});
