const express = require('express');
const app = express();


const PORT = process.env.PORT || 3000;


app.use(express.json());


app.get('/', (req, res) => {
    res.json({
        mensagem: "API Online",
        status: "Funcionando corretamente"
    });
});


app.post('/roblox', (req, res) => {
    const dadosRecebidos = req.body;

    console.log("Dados recebidos do Roblox:", dadosRecebidos);

  
    res.json({
        resposta: "Api respondeu e esta funcionando",
        sucesso: true,
        recebido: dadosRecebidos
    });
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
