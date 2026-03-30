const express = require('express');
const { createCanvas } = require('canvas');
const { JSDOM, ResourceLoader } = require('jsdom');
const app = express();

const WIDTH = 32; 
const HEIGHT = 32;

// Sistema de Logs e Status
let systemLogs = {
    status: "Iniciando",
    downloading: false,
    lastError: "Nenhum",
    engineLoaded: false,
    framesProcessed: 0
};

const resourceLoader = new ResourceLoader({
    userAgent: "Mozilla/5.0 (Node.js) WebGL-Shim",
});

// Intercepta o início do download
resourceLoader.fetch = function(url, options) {
    systemLogs.downloading = true;
    systemLogs.status = `Baixando: ${url.split('/').pop()}`;
    return ResourceLoader.prototype.fetch.call(this, url, options);
};

const serverCanvas = createCanvas(WIDTH, HEIGHT);
const serverCtx = serverCanvas.getContext('2d');

app.get('/render', (req, res) => {
    systemLogs.framesProcessed++;
    
    // Captura pixels
    const imageData = serverCtx.getImageData(0, 0, WIDTH, HEIGHT).data;
    const pixels = [];
    for (let i = 0; i < imageData.length; i += 4) {
        pixels.push(imageData[i], imageData[i+1], imageData[i+2]);
    }

    // Envia os pixels JUNTO com os logs de sistema
    res.json({
        width: WIDTH,
        height: HEIGHT,
        data: pixels,
        logs: systemLogs // O Roblox agora recebe isso!
    });
});

app.get('/jump', (req, res) => {
    systemLogs.status = "Comando de pulo recebido";
    res.json({ success: true });
});

app.listen(process.env.PORT || 3000, () => {
    systemLogs.status = "Servidor Online";
    console.log("Sistema de Logs Ativo");
});
