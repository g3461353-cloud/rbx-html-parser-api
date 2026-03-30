const express = require('express');
const { createCanvas } = require('canvas');
const { JSDOM, ResourceLoader } = require('jsdom');
const app = express();

// Configurações fixas para economizar memória
const WIDTH = 32;
const HEIGHT = 32;
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d', { alpha: false }); // Desativa alpha para ganhar performance

let status = { prog: 0, active: false };

// Loader otimizado: ignora CSS e Imagens pesadas, foca apenas nos Scripts
class LightLoader extends ResourceLoader {
    fetch(url, options) {
        if (url.endsWith('.css') || url.endsWith('.png') || url.endsWith('.jpg')) {
            return Promise.resolve(Buffer.from("")); 
        }
        return super.fetch(url, options).then(res => {
            status.prog += 25; // Simulação de progresso simples
            return res;
        });
    }
}

const dom = new JSDOM(`<!DOCTYPE html><html><body><canvas id="application-canvas"></canvas></body></html>`, {
    runScripts: "dangerously",
    resources: new LightLoader(),
    pretendToBeVisual: false // Desligar visual ajuda a poupar RAM
});

// Mock de WebGL ultra-rápido
dom.window.HTMLCanvasElement.prototype.getContext = (type) => {
    status.active = true;
    return ctx;
};

app.get('/render', (req, res) => {
    // Extração direta para Uint8ClampedArray (mais rápido que Array comum)
    const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
    const pixels = new Uint8Array(WIDTH * HEIGHT * 3);
    
    for (let i = 0, j = 0; i < imgData.length; i += 4, j += 3) {
        pixels[j] = imgData[i];     // R
        pixels[j+1] = imgData[i+1]; // G
        pixels[j+2] = imgData[i+2]; // B
    }

    res.json({
        d: Array.from(pixels), // Envia com chaves curtas para diminuir o tamanho do JSON
        s: status
    });
});

app.listen(process.env.PORT || 3000);
