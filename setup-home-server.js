const fs = require('fs');
const path = require('path');

class HomeServerSetup {
    constructor() {
        this.config = JSON.parse(fs.readFileSync('server-config.json', 'utf8'));
    }

    // Cria estrutura de pastas no servidor
    createServerStructure() {
        console.log('Criando estrutura de pastas no servidor...');
        
        const serverPath = this.config.server.mediaPath;
        const thumbnailsPath = this.config.server.thumbnailsPath;
        
        // Cria pastas principais
        this.ensureDir(serverPath);
        this.ensureDir(thumbnailsPath);
        this.ensureDir(path.join(serverPath, 'Boston'));
        this.ensureDir(path.join(serverPath, 'NewYork'));
        this.ensureDir(path.join(serverPath, 'Retorno'));
        
        // Cria subpastas do Boston
        const bostonCategories = [
            'Acomodações', 'Cientistas Cristãos', 'Começo', 'Desembarque em Boston',
            'diversas', 'EC College', 'Freedom Trail', 'Harvard', 'Igreja no Quincy',
            'M.I.T', 'Memorial de Guerra', 'Parque', 'Partida'
        ];
        
        bostonCategories.forEach(category => {
            this.ensureDir(path.join(serverPath, 'Boston', category));
        });
        
        // Cria subpastas do New York
        const newyorkCategories = [
            'Central Park', 'Downtown', 'Empire State Building', 'Estatua da Liberdade',
            'Memorial world Trade Center', 'Pier', 'Ponte', 'times square',
            'Videos', 'Viagem', 'Retorno'
        ];
        
        newyorkCategories.forEach(category => {
            this.ensureDir(path.join(serverPath, 'NewYork', category));
        });
        
        console.log('✓ Estrutura de pastas criada');
    }

    // Cria arquivo de configuração do servidor web
    createServerConfig() {
        const serverConfig = {
            port: 8080,
            mediaPath: this.config.server.mediaPath,
            thumbnailsPath: this.config.server.thumbnailsPath,
            cors: {
                origin: "*",
                methods: ["GET", "HEAD", "OPTIONS"],
                allowedHeaders: ["Range", "Content-Type"]
            },
            cache: {
                maxAge: 31536000, // 1 ano
                etag: true
            }
        };

        fs.writeFileSync('server-config.json', JSON.stringify(serverConfig, null, 2));
        console.log('✓ Configuração do servidor criada');
    }

    // Cria script de servidor web simples
    createWebServer() {
        const serverScript = `const express = require('express');
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
app.use('/media', express.static('${this.config.server.mediaPath}', {
    maxAge: '1y',
    etag: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.mp4') || filePath.endsWith('.mov') || filePath.endsWith('.mkv')) {
            res.setHeader('Accept-Ranges', 'bytes');
        }
        if (filePath.endsWith('.mov')) {
            res.setHeader('Content-Type', 'video/quicktime');
        }
    }
}));

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Servidor rodando em http://0.0.0.0:\${PORT}\`);
    console.log(\`Mídias disponíveis em http://0.0.0.0:\${PORT}/media\`);
});

module.exports = app;`;

        fs.writeFileSync('home-server.js', serverScript);
        console.log('✓ Script do servidor web criado');
    }

    // Cria package.json para o servidor
    createServerPackageJson() {
        const packageJson = {
            name: "intercambio-home-server",
            version: "1.0.0",
            description: "Servidor pessoal para mídias do intercâmbio",
            main: "home-server.js",
            scripts: {
                start: "node home-server.js",
                dev: "nodemon home-server.js"
            },
            dependencies: {
                express: "^4.18.2",
                cors: "^2.8.5"
            },
            devDependencies: {
                nodemon: "^3.0.1"
            }
        };

        fs.writeFileSync('home-server-package.json', JSON.stringify(packageJson, null, 2));
        console.log('✓ Package.json do servidor criado');
    }

    // Cria script de instalação do servidor
    createInstallScript() {
        const installScript = `@echo off
echo ========================================
echo    INSTALADOR - SERVIDOR PESSOAL
echo    Intercambio Media Server
echo ========================================
echo.

echo [1/3] Copiando arquivos de configuração...
copy home-server-package.json package.json
echo ✓ Arquivos copiados

echo.
echo [2/3] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo [3/3] Configurando servidor...
echo ✓ Servidor configurado

echo.
echo ========================================
echo    INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo Para iniciar o servidor:
echo   npm start
echo.
echo O servidor estara disponivel em:
echo   http://seu-ip:8080
echo.
pause`;

        fs.writeFileSync('install-server.bat', installScript);
        console.log('✓ Script de instalação criado');
    }

    // Cria instruções de configuração
    createInstructions() {
        const instructions = `# Configuração do Servidor Pessoal

## 🏠 Configuração do Servidor em Casa

### 1. Preparar o Servidor
1. Copie todos os arquivos para uma pasta no seu servidor
2. Execute: \`install-server.bat\`
3. Configure o IP do servidor em \`server-config.json\`

### 2. Configurar Rede
1. **IP Estático**: Configure um IP fixo para o servidor
2. **Porta**: Abra a porta 8080 no firewall
3. **Roteador**: Configure port forwarding se necessário

### 3. Estrutura de Pastas
\`\`\`
/media/intercambio/
├── Boston/
│   ├── Acomodações/
│   ├── Cientistas Cristãos/
│   └── ...
├── NewYork/
│   ├── Central Park/
│   ├── Downtown/
│   └── ...
└── thumbnails/
\`\`\`

### 4. Copiar Mídias
1. Copie suas mídias para a pasta \`/media/intercambio/\`
2. Organize nas subpastas conforme sua estrutura atual
3. Execute o processador para gerar metadados

### 5. Iniciar Servidor
\`\`\`bash
npm start
\`\`\`

### 6. Testar Acesso
- Local: http://localhost:8080/health
- Rede: http://seu-ip:8080/health
- Mídias: http://seu-ip:8080/media/

## 🌐 Configuração do Firebase

### 1. Instalar Firebase CLI
\`\`\`bash
npm install -g firebase-tools
\`\`\`

### 2. Login no Firebase
\`\`\`bash
firebase login
\`\`\`

### 3. Inicializar Projeto
\`\`\`bash
firebase init hosting
\`\`\`

### 4. Configurar Deploy
1. Atualize \`server-config.json\` com seu IP
2. Execute: \`npm run process-remote\`
3. Execute: \`npm run deploy\`

## 🔧 Troubleshooting

### Servidor não acessível
- Verifique firewall
- Confirme IP estático
- Teste com \`telnet seu-ip 8080\`

### Mídias não carregam
- Verifique permissões das pastas
- Confirme estrutura de pastas
- Teste URL diretamente no navegador

### Firebase deploy falha
- Verifique login: \`firebase login --reauth\`
- Confirme projeto: \`firebase use --add\`
- Verifique arquivos em \`public/\`
`;

        fs.writeFileSync('SERVER-SETUP.md', instructions);
        console.log('✓ Instruções criadas');
    }

    ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    // Executa toda a configuração
    setup() {
        console.log('Configurando servidor pessoal...\n');
        
        this.createServerStructure();
        this.createServerConfig();
        this.createWebServer();
        this.createServerPackageJson();
        this.createInstallScript();
        this.createInstructions();
        
        console.log('\n✅ Configuração do servidor concluída!');
        console.log('\nPróximos passos:');
        console.log('1. Configure seu IP em server-config.json');
        console.log('2. Copie os arquivos para seu servidor');
        console.log('3. Execute install-server.bat no servidor');
        console.log('4. Copie suas mídias para a pasta /media/intercambio/');
        console.log('5. Execute npm run process-remote');
        console.log('6. Execute npm run deploy');
    }
}

// Executa se chamado diretamente
if (require.main === module) {
    const setup = new HomeServerSetup();
    setup.setup();
}

module.exports = HomeServerSetup;
