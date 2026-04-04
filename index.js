const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Transforma o código em uma array de números (ASCII/RGBA fake) 
// que o Roblox lerá para montar o CanvasGroup
function generatePixelData(js, css) {
    const content = `[CSS]${css}[JS]${js}`;
    const data = [];
    
    for (let i = 0; i < content.length; i++) {
        data.push(content.charCodeAt(i));
    }
    
    return {
        pixels: data,
        size: Math.ceil(Math.sqrt(data.length))
    };
}

app.get('/translate', (req, res) => {
    const { js, css } = req.query;

    if (!js || !css) {
        return res.status(400).json({ error: "Envie js e css via query params" });
    }

    const result = generatePixelData(js, css);
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Servidor ativo na porta ${PORT}`);
});
