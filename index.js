const express = require('express');
const { JSDOM } = require('jsdom');
const { createCanvas } = require('canvas');
const app = express();

app.use(express.json({ limit: '50mb' }));

let pixelsGlobais = [];

// Rota para evitar o "Cannot GET /"
app.get('/', (req, res) => res.send("API ONLINE - Envie HTML para /processar"));

app.post('/processar', (req, res) => {
    const { html } = req.body;
    
    try {
        // Criando o ambiente virtual com suporte a Canvas
        const dom = new JSDOM(html, {
            runScripts: "dangerously",
            resources: "usable",
            pretendToBeVisual: true
        });

        const { window } = dom;
        
        // "Mock" de funções que o PlayCanvas exige e o JSDOM não tem
        window.HTMLCanvasElement.prototype.getContext = (type) => {
            return createCanvas(50, 50).getContext('2d');
        };

        // Espera o processamento (5 segundos)
        setTimeout(() => {
            try {
                // Tentamos capturar o canvas gerado pelo HTML
                const gameCanvas = window.document.getElementById('application-canvas') || window.document.querySelector('canvas');
                
                const outputCanvas = createCanvas(50, 50);
                const ctx = outputCanvas.getContext('2d');

                if (gameCanvas) {
                    ctx.drawImage(gameCanvas, 0, 0, 50, 50);
                } else {
                    // Se não achou o canvas do jogo, pinta de vermelho para teste
                    ctx.fillStyle = "red";
                    ctx.fillRect(0, 0, 50, 50);
                }

                const imageData = ctx.getImageData(0, 0, 50, 50).data;
                let pixels = [];
                for (let i = 0; i < imageData.length; i += 4) {
                    pixels.push([imageData[i], imageData[i+1], imageData[i+2]]);
                }

                pixelsGlobais = pixels;
                console.log("Processado com sucesso!");
                res.json({ sucesso: true, msg: "Pixels extraídos" });
            } catch (innerErr) {
                console.error("Erro interno no processamento:", innerErr);
                res.json({ sucesso: false, erro: innerErr.message });
            } finally {
                window.close(); // Libera memória
            }
        }, 5000);

    } catch (err) {
        console.error("Erro ao criar JSDOM:", err);
        res.status(500).json({ erro: "Falha ao iniciar ambiente virtual" });
    }
});

app.get('/render', (req, res) => res.json(pixelsGlobais));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando!"));
