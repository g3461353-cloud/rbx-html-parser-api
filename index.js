const express = require('express');
const { JSDOM } = require('jsdom');
const { createCanvas } = require('canvas');
const createContext = require('gl'); // Simula WebGL no Node
const app = express();

const WIDTH = 32;
const HEIGHT = 32;

// Criamos um ambiente DOM mínimo
localDom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="application-canvas"></canvas></body></html>`, {
    runScripts: "dangerously",
    resources: "usable"
});

const { window } = localDom;
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.HTMLCanvasElement = window.HTMLCanvasElement;

// Mock do WebGL para o motor não quebrar
const canvas = window.document.getElementById('application-canvas');
canvas.getContext = (type) => {
    if (type === 'webgl' || type === 'experimental-webgl' || type === 'webgl2') {
        return createContext(WIDTH, HEIGHT);
    }
};

app.get('/render', (req, res) => {
    // Aqui capturamos o conteúdo atual do canvas simulado
    const nodeCanvas = createCanvas(WIDTH, HEIGHT);
    const nodeCtx = nodeCanvas.getContext('2d');
    
    // Desenhamos o que estiver no canvas do JSDOM para o nosso canvas de saída
    nodeCtx.drawImage(canvas, 0, 0, WIDTH, HEIGHT);

    const imageData = nodeCtx.getImageData(0, 0, WIDTH, HEIGHT).data;
    const pixels = [];

    for (let i = 0; i < imageData.length; i += 4) {
        pixels.push(imageData[i], imageData[i+1], imageData[i+2]);
    }

    res.json({ width: WIDTH, height: HEIGHT, data: pixels });
});

// Simula o pulo alterando o estado global ou disparando evento
app.get('/jump', (req, res) => {
    const event = new window.KeyboardEvent('keydown', { keyCode: 32 }); // Espaço
    window.dispatchEvent(event);
    res.send("Pulo enviado");
});

app.listen(process.env.PORT || 3000);
