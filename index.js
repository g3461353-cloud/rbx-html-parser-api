const express = require('express');
const { createCanvas } = require('canvas');
const app = express();
const port = process.env.PORT || 3000;

// Configuração do Canvas (mantenha baixo para performance no Roblox)
const WIDTH = 32; 
const HEIGHT = 32;
const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

let frameCount = 0;

function drawFrame() {
    // Exemplo de animação: um quadrado se movendo
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    ctx.fillStyle = 'red';
    ctx.fillRect((frameCount % WIDTH), 10, 5, 5);
    frameCount++;
}

app.get('/render', (req, res) => {
    drawFrame();
    
    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
    const pixels = [];

    // Estrutura os dados: [R, G, B, R, G, B...]
    // Pulamos o Alpha (index + 3) para economizar dados
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
    console.log(`Servidor rodando na porta ${port}`);
});
