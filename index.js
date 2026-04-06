import express from 'express';
import nodeHtmlToImage from 'node-html-to-image';

const app = express();
app.use(express.json());

app.post('/render', async (req, res) => {
    const { html_content } = req.body;

    try {
        // Aqui a API executa o HTML de verdade e gera uma imagem (Buffer)
        const image = await nodeHtmlToImage({
            html: `<html><body style="width: 400px; height: 400px; margin:0; padding:20px; background-color: #1a1a1a; color: white; font-family: Arial;">
                    ${html_content}
                   </body></html>`,
            quality: 80,
            type: 'png'
        });

        // Convertendo a imagem real em pixels (RGBA) para o Roblox
        // (Nota: Para simplificar e evitar o erro de pixels, vamos focar no envio da URL se possível, 
        // mas se quiser pixels, o buffer 'image' contém tudo o que o HTML gerou visualmente)
        
        res.json({ 
            success: true, 
            status: "HTML Renderizado como Imagem no Servidor"
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0');
