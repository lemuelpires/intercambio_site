const fs = require('fs');
const path = require('path');

class ServerUploader {
    constructor() {
        this.config = JSON.parse(fs.readFileSync('server-config.json', 'utf8'));
        this.serverUrl = this.config.baseUrl;
    }

    // Cria instruções de upload
    generateUploadInstructions() {
        const instructions = `# Instruções para Upload no Servidor

## 📁 Estrutura de Pastas no Servidor

Crie a seguinte estrutura no seu servidor www.portalmantec.com.br:

\`\`\`
/
├── media/
│   └── intercambio/
│       ├── Boston/
│       │   ├── Acomodações/
│       │   ├── Cientistas Cristãos/
│       │   ├── Começo/
│       │   ├── Desembarque em Boston/
│       │   ├── diversas/
│       │   ├── EC College/
│       │   ├── Freedom Trail/
│       │   ├── Harvard/
│       │   ├── Igreja no Quincy/
│       │   ├── M.I.T/
│       │   ├── Memorial de Guerra/
│       │   ├── Parque/
│       │   ├── Partida/
│       │   ├── Pier/
│       │   ├── Pizza em estabelecimento na John Adams/
│       │   ├── Primeiro Tratejo à escola/
│       │   ├── Proximidades da escola/
│       │   ├── Quincy Center/
│       │   ├── Ruas de Boston/
│       │   ├── Suprema Corte Michigan/
│       │   └── Videos/
│       ├── NewYork/
│       │   ├── Central Park/
│       │   ├── Downtown/
│       │   ├── Empire State Building/
│       │   ├── Estatua da Liberdade/
│       │   ├── Memorial world Trade Center/
│       │   ├── Pier/
│       │   ├── Ponte/
│       │   ├── times square/
│       │   └── Viagem/
│       └── thumbnails/
└── intercambio/ (arquivos do site)
    ├── index.html
    ├── boston.html
    ├── newyork.html
    ├── styles.css
    ├── remote-gallery.js
    ├── config.json
    └── data/
        ├── boston.json
        └── newyork.json
\`\`\`

## 🚀 Passos para Upload

### 1. Upload das Mídias
Copie TODAS as suas mídias de:
\`C:\\Users\\lemuel\\Desktop\\wordpress\\projetos Intercâmbio\\fotos Intercambio\\\`

Para:
\`/media/intercambio/\` no seu servidor

### 2. Upload do Site
Copie os arquivos da pasta \`public/\` para:
\`/intercambio/\` no seu servidor

### 3. Configurar Permissões
\`\`\`bash
# No servidor, execute:
chmod -R 755 /media/intercambio/
chmod -R 755 /intercambio/
\`\`\`

### 4. Testar Acesso
- Site: https://www.portalmantec.com.br/intercambio/
- Mídias: https://www.portalmantec.com.br/media/intercambio/

## 📊 Tamanho dos Arquivos

- **Mídias**: ~30GB (todas as fotos e vídeos)
- **Site**: ~2MB (HTML, CSS, JS, JSON)

## ⚠️ Importante

1. **Backup**: Faça backup antes de fazer upload
2. **Permissões**: Configure corretamente as permissões de leitura
3. **CORS**: Configure CORS no servidor se necessário
4. **SSL**: Use HTTPS para melhor segurança

## 🔧 Configuração do Servidor Web

Se usar Apache, adicione no .htaccess:

\`\`\`apache
# Permitir CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, HEAD, OPTIONS"
Header always set Access-Control-Allow-Headers "Range, Content-Type"

# Cache para mídias
<FilesMatch "\\.(jpg|jpeg|png|gif|mp4|mov)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
\`\`\`

Se usar Nginx, adicione:

\`\`\`nginx
location /media/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS";
    add_header Access-Control-Allow-Headers "Range, Content-Type";
    expires 1y;
}
\`\`\`
`;

        fs.writeFileSync('UPLOAD-INSTRUCTIONS.md', instructions);
        console.log('✓ Instruções de upload criadas em UPLOAD-INSTRUCTIONS.md');
    }

    // Cria script de verificação
    generateVerificationScript() {
        const script = `// Script para verificar se o upload foi feito corretamente
const testUrls = [
    'https://www.portalmantec.com.br/intercambio/',
    'https://www.portalmantec.com.br/intercambio/boston.html',
    'https://www.portalmantec.com.br/intercambio/newyork.html',
    'https://www.portalmantec.com.br/intercambio/data/boston.json',
    'https://www.portalmantec.com.br/intercambio/data/newyork.json'
];

async function testUrls() {
    for (const url of testUrls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                console.log('✅', url, '- OK');
            } else {
                console.log('❌', url, '- Erro:', response.status);
            }
        } catch (error) {
            console.log('❌', url, '- Erro:', error.message);
        }
    }
}

testUrls();`;

        fs.writeFileSync('public/test-upload.html', `<!DOCTYPE html>
<html>
<head>
    <title>Teste de Upload</title>
</head>
<body>
    <h1>Teste de Upload do Servidor</h1>
    <div id="results"></div>
    <script>
        ${script}
    </script>
</body>
</html>`);

        console.log('✓ Script de verificação criado em public/test-upload.html');
    }

    // Executa tudo
    run() {
        console.log('Gerando instruções de upload...');
        this.generateUploadInstructions();
        this.generateVerificationScript();
        
        console.log('\n✅ Instruções criadas!');
        console.log('\nPróximos passos:');
        console.log('1. Leia UPLOAD-INSTRUCTIONS.md');
        console.log('2. Faça upload das mídias para /media/intercambio/');
        console.log('3. Faça upload dos arquivos de public/ para /intercambio/');
        console.log('4. Teste com public/test-upload.html');
    }
}

// Executa se chamado diretamente
if (require.main === module) {
    const uploader = new ServerUploader();
    uploader.run();
}

module.exports = ServerUploader;



