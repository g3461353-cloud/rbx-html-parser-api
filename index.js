const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Função simples para converter strings em uma matriz de "pixels" (valores numéricos)
// Cada caractere é convertido para seu valor ASCII para ser lido pelo Canvas no Roblox
function parseToPixels(jsContent, cssContent) {
    const combined = `/*CSS*/${cssContent}/*JS*/${jsContent}`;
    const pixels = [];
    
    for (let i = 0; i < combined.length; i++) {
        pixels.push(combined.charCodeAt(i));
    }
    
    return {
        data: pixels,
        width: Math.ceil(Math.sqrt(pixels.length)),
        length: pixels.length
    };
}

app.get('/translate', (req, res) => {
    const { js, css } = req.query;

    if (!js || !css) {
        return res.status(400).json({ error: "Missing js or css query parameters" });
    }

    const payload = parseToPixels(js, css);
    res.json(payload);
});

app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
});
