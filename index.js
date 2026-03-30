const express = require('express');
const { createCanvas } = require('canvas');
const { JSDOM, ResourceLoader } = require('jsdom');
const app = express();

const WIDTH = 32; 
const HEIGHT = 32;

// Loader para permitir que o JSDOM baixe os scripts da Amazon S3
const resourceLoader = new ResourceLoader({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
});

const playcanvasHTML = `
    <html>
    <head>
        <script src="https://s3-eu-west-1.amazonaws.com/apps.playcanvas.com/DLgXf1zr/playcanvas-stable.min.js"></script>
        <script>
            ASSET_PREFIX = "https://s3-eu-west-1.amazonaws.com/apps.playcanvas.com/DLgXf1zr/";
            SCRIPT_PREFIX = "https://s3-eu-west-1.amazonaws.com/apps.playcanvas.com/DLgXf1zr/";
            SCENE_PATH = "404993.json";
            CONTEXT_OPTIONS = { 'antialias': true, 'alpha': false, 'preserveDrawingBuffer': true };
            SCRIPTS = [ 37175323, 21399876, 4554207, 4554213, 4554214, 4554217, 4554270, 4554271, 4554273, 4554276, 4554279, 20754603, 20755574, 37175329, 37186400 ];
            CONFIG_FILENAME = "https://s3-eu-west-1.amazonaws.com/apps.playcanvas.com/DLgXf1zr/config.json";
            INPUT_SETTINGS = { useKeyboard: true, useMouse: true, useTouch: true };
            pc.script.legacy = false;
        </script>
        <script src="https://s3-eu-west-1.amazonaws.com/apps.playcanvas.com/DLgXf1zr/__game-scripts.js"></script>
    </head>
    <body>
        <canvas id="application-canvas" width="${WIDTH}" height="${HEIGHT}"></canvas>
        <script src="https://s3-eu-west-1.amazonaws.com/apps.playcanvas.com/DLgXf1zr/__start__.js"></script>
    </body>
    </html>
`;

const dom = new JSDOM(playcanvasHTML, {
    runScripts: "dangerously",
    resources: resourceLoader,
    pretendToBeVisual: true
});

const { window } = dom;

// Mock do Canvas para o Node-Canvas
const internalCanvas = createCanvas(WIDTH, HEIGHT);
const internalCtx = internalCanvas.getContext('2d');

// Redireciona o contexto do motor para o nosso buffer
window.HTMLCanvasElement.prototype.getContext = function(type) {
    return internalCtx;
};

app.get('/render', (req, res) => {
    // Captura os pixels gerados pelo motor
    const imageData = internalCtx.getImageData(0, 0, WIDTH, HEIGHT).data;
    const pixels = [];

    for (let i = 0; i < imageData.length; i += 4) {
        pixels.push(imageData[i], imageData[i+1], imageData[i+2]);
    }

    res.json({
        width: WIDTH,
        height: HEIGHT,
        data: pixels
    });
});

// Endpoint para interagir (pular)
app.get('/jump', (req, res) => {
    const event = new window.KeyboardEvent('keydown', { keyCode: 32 }); // Espaço
    window.dispatchEvent(event);
    res.send("Jump Sent");
});

app.listen(process.env.PORT || 3000, () => console.log("PlayCanvas WebGL Shim Live"));
