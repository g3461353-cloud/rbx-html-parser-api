import express from 'express';

const app = express();
app.use(express.json());

// VARIÁVEL DE PIXELIZAÇÃO: 
// Quanto maior o número, mais "quadradão" e leve fica. 
// 1 = Resolução máxima (pesado), 10 = Bem pixelado (leve).
const PIXEL_GRID = 5; 

app.post('/render', (req, res) => {
    try {
        const { html_content } = req.body;
        
        // O "Tradutor": Em vez de bitmap, mandamos comandos de desenho
        const ui_commands = [];

        // Exemplo de lógica: se encontrar H1, cria um comando de texto
        if (html_content.includes('<h1>')) {
            const cleanText = html_content.replace(/<[^>]*>/g, '');
            ui_commands.push({
                type: "Text",
                content: cleanText,
                size: [1, 0, 0.3, 0],
                pos: [0, 0, 0.1, 0],
                color: "#FFFFFF"
            });
        }

        // Fundo padrão
        ui_commands.push({
            type: "Rect",
            color: "#222222",
            size: [1, 0, 1, 0],
            pos: [0, 0, 0, 0],
            zIndex: 0
        });

        res.json({ 
            success: true, 
            grid_scale: PIXEL_GRID, 
            commands: ui_commands 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Online na porta ${PORT} com GRID ${PIXEL_GRID}`);
});
