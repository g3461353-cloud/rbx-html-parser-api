import express from 'express';

const app = express();
app.use(express.json());

app.post('/render', (req, res) => {
    try {
        const { html_content } = req.body;
        const commands = [];

        // Tradutor Automático Simples
        // Procura por H1
        if (html_content.includes('<h1>')) {
            const match = html_content.match(/<h1>(.*?)<\/h1>/);
            if (match) {
                commands.push({
                    type: "Text",
                    content: match[1],
                    size: [0.9, 0, 0.2, 0],
                    pos: [0.05, 0, 0.05, 0],
                    color: "#FFFFFF"
                });
            }
        }

        // Procura por IMG
        if (html_content.includes('<img')) {
            const match = html_content.match(/src=["'](.*?)["']/);
            if (match) {
                commands.push({
                    type: "Image",
                    url: match[1],
                    size: [0.8, 0, 0.5, 0],
                    pos: [0.1, 0, 0.3, 0]
                });
            }
        }

        // Fundo (Background)
        commands.push({
            type: "Rect",
            color: "#121212",
            size: [1, 0, 1, 0],
            pos: [0, 0, 0, 0],
            zIndex: 0
        });

        res.json({ success: true, commands: commands });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Rodando na porta ${PORT}`);
});
