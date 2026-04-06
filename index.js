import express from 'express';
import pkg from 'canvas';
const { createCanvas } = pkg;

const app = express();

// Aumentando o limite do JSON pois o array de pixels é pesado
app.use(express.json({ limit: '10mb' }));

const WIDTH = 256;
const HEIGHT = 256;

app.post('/render', (req, res) => {
    try {
        const { html_content, color } = req.body;

        const canvas = createCanvas(WIDTH, HEIGHT);
        const ctx = canvas.getContext('2d');

        // Limpa o canvas (Fundo transparente ou sólido)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Renderização Simples (Simulando o HTML)
        ctx.fillStyle = color || '#ff0000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(html_content || 'Roblox Engine', WIDTH / 2, HEIGHT / 2);

        // Extrai os pixels brutos (RGBA)
        const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
        
        // O Roblox espera uma tabela de números. 
        // O Uint8ClampedArray do JS é perfeito para isso.
        const pixelArray = Array.from(imageData.data);

        res.status(200).json({
            success: true,
            width: WIDTH,
            height: HEIGHT,
            pixels: pixelArray
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
    console.log(`Dica: No Roblox, use HttpService para postar em seu IP/render`);
});
