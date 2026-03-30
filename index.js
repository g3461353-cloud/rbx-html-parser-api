const express = require('express');
const { createCanvas } = require('canvas');
const { JSDOM } = require('jsdom');
const app = express();
const port = process.env.PORT || 3000;

const WIDTH = 32; 
const HEIGHT = 32;

app.get('/render', (req, res) => {
    const htmlInput = req.query.html || " "; // Recebe a string HTML do GET
    
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Limpa o fundo (Garante que não fique apenas preto se houver algo)
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Usa JSDOM para parsear a string e extrair o texto/estilo simples
    const dom = new JSDOM(htmlInput);
    const textContent = dom.window.document.body.textContent || "";
    
    // Renderiza o "conteúdo" do HTML como texto no canvas
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.fillText(textContent, 2, 15);

    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
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

app.listen(port, () => {
    console.log(`API Rodando`);
});
