const express = require('express');
const app = express();

// Aumentamos o limite para suportar o envio de muitos pixels de uma vez
app.use(express.json({ limit: '20mb' }));

let frameAtual = []; // Armazena o último quadro de pixels recebido

// Rota para o seu script (Python/PC) enviar os pixels processados
app.post('/enviar-frame', (req, res) => {
    if (req.body.pixels && Array.isArray(req.body.pixels)) {
        frameAtual = req.body.pixels;
        console.log(`Frame recebido: ${frameAtual.length} pixels.`);
        return res.json({ sucesso: true, mensagem: "Frame atualizado!" });
    }
    res.status(400).json({ sucesso: false, mensagem: "Formato de pixels inválido." });
});

// Rota que o Roblox vai chamar para pegar os pixels e desenhar
app.get('/receber-frame', (req, res) => {
    res.json({
        pixels: frameAtual,
        total: frameAtual.length
    });
});

// Rota de teste simples
app.get('/', (req, res) => {
    res.send("API de Transmissão Roblox está Online!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
