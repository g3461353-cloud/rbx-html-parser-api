const express = require('express'); // 1. Importa o módulo
const { createCanvas } = require('canvas');
const app = express(); // 2. CRIA a instância do app (O erro está aqui!)

app.use(express.json());

app.post('/live-sync', (req, res) => {
    const { width = 32, height = 32 } = req.body;
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // TESTE: Pinta o fundo de verde e um quadrado central
    ctx.fillStyle = '#00ff00'; 
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 10, 12, 12);

    // Retorna o buffer bruto (RGBA)
    const buffer = canvas.toBuffer('raw');
    res.send(buffer);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
