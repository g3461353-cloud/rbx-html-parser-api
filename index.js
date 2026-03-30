const express = require('express');
const { createCanvas } = require('canvas');
const app = express();

app.use(express.json());

app.post('/live-sync', (req, res) => {
    const { files, width, height } = req.body;
    
    // Criamos um canvas interno (ex: 64x64)
    const canvas = createCanvas(width || 64, height || 64);
    const ctx = canvas.getContext('2d');

    // Simulação de processamento de "Camadas"
    // Aqui você pode processar a lógica dos arquivos JS recebidos
    // Exemplo: se o style.css tiver um background-color, pintamos o canvas
    if (files['style.css'] && files['style.css'].includes('red')) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Retorna os dados puramente binários dos pixels (RGBA)
    const buffer = canvas.toBuffer('raw'); 
    res.send(buffer);
});

app.listen(3000);
