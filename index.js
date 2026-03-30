const express = require('express');
const { JSDOM } = require('jsdom');
const { createCanvas } = require('canvas');
const app = express();

app.use(express.json({ limit: '10mb' }));

let pixelsGlobais = [];

app.post('/processar', (req, res) => {
    const { html } = req.body;

    // Cria um DOM virtual leve
    const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    const { window } = dom;

    // Tenta capturar o Canvas que o jogo do Flappy Bird cria
    setTimeout(() => {
        try {
            const canvasJogo = window.document.getElementById('application-canvas');
            if (canvasJogo) {
                const ctx = canvasJogo.getContext('2d');
                const largura = 50; 
                const altura = 50;
                
                // Extrai os dados de imagem
                const imageData = ctx.getImageData(0, 0, largura, altura).data;
                let pixels = [];
                
                for (let i = 0; i < imageData.length; i += 4) {
                    pixels.push([imageData[i], imageData[i+1], imageData[i+2]]);
                }
                pixelsGlobais = pixels;
                res.json({ sucesso: true, msg: "Pixels capturados" });
            } else {
                res.json({ sucesso: false, msg: "Canvas não encontrado no HTML" });
            }
        } catch (e) {
            res.status(500).json({ erro: e.message });
        }
    }, 1000); // Espera 1 segundo para o JS do jogo "montar" o frame
});

app.get('/render', (req, res) => {
    res.json(pixelsGlobais);
});

app.listen(process.env.PORT || 3000, () => console.log("API Rodando"));
