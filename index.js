const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Um mapa de bits 3x5 simplificado para números (0-9) e ":"
const FONT = {
    '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
    '1': [[0,1,0],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
    '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
    '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
    '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
    '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
    '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
    '7': [[1,1,1],[0,0,1],[0,1,0],[0,1,0],[0,1,0]],
    '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
    '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
    ':': [[0,0,0],[0,1,0],[0,0,0],[0,1,0],[0,0,0]],
    ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]
};

app.get('/translate', (req, res) => {
    // Simulando o tempo do timer (ex: 00:59)
    const text = req.query.text || "00:59"; 
    const grid = [[],[],[],[],[]]; // 5 linhas de altura

    // Desenha cada caractere na grade
    for (let char of text) {
        const bitmap = FONT[char] || FONT[' '];
        for (let row = 0; row < 5; row++) {
            grid[row].push(...bitmap[row], 0); // Adiciona o caractere + 1 espaço vazio
        }
    }

    // Achata a grade em uma lista simples de pixels (0 ou 1)
    const flatPixels = grid.flat();
    res.json({
        pixels: flatPixels,
        cols: grid[0].length,
        rows: 5
    });
});

app.listen(PORT, () => console.log("API Online"));
