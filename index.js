import express from 'express';
import pkg from 'canvas';
const { createCanvas } = pkg;

const app = express();

// Aumenta o limite para aguentar o envio de pixels do Roblox
app.use(express.json({ limit: '20mb' }));

const WIDTH = 256;
const HEIGHT = 256;

app.post('/render', (req, res) => {
    try {
        const { html_content, color } = req.body;

        const canvas = createCanvas(WIDTH, HEIGHT);
        const ctx = canvas.getContext('2d');

        // Fundo Branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Desenho Simples (Simulando Render de HTML)
        ctx.fillStyle = color || '#000000';
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(html_content || 'Renderizado via API', WIDTH / 2, HEIGHT / 2);

        // Extração de pixels RGBA
        const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
        const pixelArray = Array.from(imageData.data);

        res.json({
            width: WIDTH,
            height: HEIGHT,
            pixels: pixelArray
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// O Render exige que a porta seja dinâmica via process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor pronto na porta ${PORT}`);
});
