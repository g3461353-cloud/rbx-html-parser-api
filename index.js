const express = require('express');
const { JSDOM } = require('jsdom');
const { createCanvas, loadImage } = require('canvas');
const app = express();

app.use(express.json({ limit: '50mb' }));

let pixelsGlobais = [];

app.post('/processar', async (req, res) => {
    const { html } = req.body;
    console.log("Recebido HTML. Iniciando processamento virtual...");

    // 1. Criar ambiente virtual que aceita scripts externos (S3 Amazon)
    const dom = new JSDOM(html, {
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true
    });

    const { window } = dom;
    const canvasVirtual = createCanvas(50, 50); // Resolução alvo para o Roblox
    const ctx = canvasVirtual.getContext('2d');

    // 2. Esperar o PlayCanvas carregar (Mínimo 3 segundos para scripts externos)
    setTimeout(() => {
        try {
            // Tentamos capturar o elemento de jogo
            const gameCanvas = window.document.getElementById('application-canvas');
            
            if (gameCanvas) {
                // Desenha o que está no jogo para o nosso canvas pequeno (Pixelização)
                ctx.drawImage(gameCanvas, 0, 0, 50, 50);
                
                const imageData = ctx.getImageData(0, 0, 50, 50).data;
                let pixels = [];

                for (let i = 0; i < imageData.length; i += 4) {
                    // Salva apenas R, G, B (ignora o Alpha para economizar dados)
                    pixels.push([imageData[i], imageData[i+1], imageData[i+2]]);
                }

                pixelsGlobais = pixels;
                console.log("Pixels capturados com sucesso: ", pixels.length);
                res.json({ sucesso: true, total: pixels.length });
            } else {
                console.log("Erro: Canvas do jogo não encontrado.");
                res.json({ sucesso: false, erro: "Canvas não renderizou a tempo" });
            }
        } catch (err) {
            console.error("Erro no processamento:", err);
            res.status(500).json({ erro: err.message });
        }
        // Fecha a janela virtual para liberar memória RAM do Render
        window.close();
    }, 5000); // 5 segundos de espera para o PlayCanvas "acordar"
});

app.get('/render', (req, res) => {
    res.json(pixelsGlobais);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Ativa na porta ${PORT}`));
