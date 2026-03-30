const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

let ultimaImagemProcessada = [];

app.post('/render-html', async (req, res) => {
    const { html } = req.body;

    try {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Define o tamanho da "tela" (Baixa resolução para performance)
        await page.setViewport({ width: 100, height: 100 });
        await page.setContent(html);

        // Espera o canvas do jogo carregar
        await page.waitForSelector('#application-canvas');

        // Captura os pixels da tela
        const pixels = await page.evaluate(() => {
            const canvas = document.querySelector('#application-canvas');
            const ctx = canvas.getContext('2d');
            // Redimensiona o canvas para 50x50 para o Roblox aguentar
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = 50;
            smallCanvas.height = 50;
            const sCtx = smallCanvas.getContext('2d');
            sCtx.drawImage(canvas, 0, 0, 50, 50);
            
            const imgData = sCtx.getImageData(0, 0, 50, 50).data;
            let colors = [];
            for (let i = 0; i < imgData.length; i += 4) {
                colors.push([imgData[i], imgData[i+1], imgData[i+2]]);
            }
            return colors;
        });

        ultimaImagemProcessada = pixels;
        await browser.close();

        res.json({ sucesso: true, mensagem: "Pixels extraídos!", total: pixels.length });
    } catch (err) {
        res.status(500).json({ sucesso: false, erro: err.message });
    }
});

// Rota que o Roblox vai chamar para pegar os pixels
app.get('/get-pixels', (req, res) => {
    res.json(ultimaImagemProcessada);
});

app.listen(PORT, '0.0.0.0', () => console.log("Servidor Real Online"));
