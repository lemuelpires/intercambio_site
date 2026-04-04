const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuração CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "HEAD", "OPTIONS"],
    allowedHeaders: ["Range", "Content-Type"]
}));

// Servir arquivos estáticos
app.use('/media', express.static('/media/intercambio', {
    maxAge: '1y',
    etag: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.mp4') || path.endsWith('.mov')) {
            res.setHeader('Accept-Ranges', 'bytes');
        }
    }
}));

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
    console.log(`Mídias disponíveis em http://0.0.0.0:${PORT}/media`);
});

module.exports = app;