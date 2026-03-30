const { createCanvas } = require('canvas');
// ... dentro da sua rota POST
app.post('/live-sync', (req, res) => {
    const { width, height } = req.body;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // TESTE VISÍVEL: Fundo Vermelho com Quadrado Azul
    ctx.fillStyle = 'red'; 
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = 'blue';
    ctx.fillRect(5, 5, 20, 20);

    // IMPORTANTE: Enviar como buffer bruto (Raw RGBA)
    const buffer = canvas.toBuffer('raw'); 
    res.send(buffer);
});
