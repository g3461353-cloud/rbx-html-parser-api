const express = require('express');
const { createCanvas } = require('canvas');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/translate', (req, res) => {
    const text = req.query.text || "00:00:00";
    
    // Criamos um canvas pequeno para economizar banda (ex: 80x20 pixels)
    const width = 100;
    const height = 30;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo preto e texto verde neon (estilo Matrix/Timer)
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = "#00FF41";
    ctx.font = "bold 16px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(text, width / 2, height / 1.5);

    // Pegamos os dados de imagem (RGBA)
    const imageData = ctx.getImageData(0, 0, width, height).data;
    const pixelData = [];

    // Otimização: Pegamos apenas o canal Green (verde) ou Alpha para reduzir o JSON
    for (let i = 0; i < imageData.length; i += 4) {
        // Se o pixel for brilhante o suficiente, marcamos como 1
        const brightness = imageData[i + 1]; // Canal Verde
        pixelData.push(brightness > 100 ? 1 : 0);
    }

    res.json({
        pixels: pixelData,
        width: width,
        height: height
    });
});

app.listen(PORT, () => console.log("API com Canvas Engine Online"));
