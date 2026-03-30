const express = require('express');
const { JSDOM } = require('jsdom');
const { createCanvas } = require('canvas');
const app = express();

app.use(express.json({ limit: '50mb' }));

let pixelsGlobais = [];

app.get('/', (req, res) => res.send("API Rodando - Aguardando HTML"));

app.post('/processar', (req, res) => {
    const { html } = req.body;
    
    const dom = new JSDOM(html, {
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: true
    });

    const { window } = dom;

    // Simula o contexto para o JSDOM não travar
    window.HTMLCanvasElement.prototype.getContext = function(type) {
        return createCanvas(this.width, this.height).getContext(type);
    };

    // Espera 7 segundos (PlayCanvas é pesado para carregar na nuvem)
    setTimeout(() => {
        try {
            // Busca o canvas por ID ou pela tag geral
            const gameCanvas = window.document.getElementById('application-canvas') || 
                               window.document.querySelector('canvas');

            const output = createCanvas(50, 50);
            const ctx = output.getContext('2d');

            // VALIDAÇÃO CRÍTICA: Verifica se o gameCanvas existe e tem largura
            if (gameCanvas && gameCanvas.width > 0) {
                ctx.drawImage(gameCanvas, 0, 0, 50, 50);
                
                const imageData = ctx.getImageData(0, 0, 50, 50).data;
                let pixels = [];
                for (let i = 0; i < imageData.length; i += 4) {
                    pixels.push([imageData[i], imageData[i+1], imageData[i+2]]);
                }
                pixelsGlobais = pixels;
                
                res.json({ sucesso: true, msg: "Capturado com sucesso!" });
            } else {
                // Se falhar, manda uma tela azul para o Roblox saber que o problema é o Canvas
                ctx.fillStyle = "blue";
                ctx.fillRect(0, 0, 50, 50);
                res.json({ sucesso: false, erro: "O elemento Canvas não foi gerado pelo HTML a tempo." });
            }
        } catch (err) {
            res.json({ sucesso: false, erro: "Erro ao processar imagem: " + err.message });
        } finally {
            window.close();
        }
    }, 7000); 
});

app.get('/render', (req, res) => res.json(pixelsGlobais));

app.listen(process.env.PORT || 3000);
