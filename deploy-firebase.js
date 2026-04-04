const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class FirebaseDeployer {
    constructor() {
        this.config = JSON.parse(fs.readFileSync('server-config.json', 'utf8'));
    }

    // Verifica se Firebase CLI está instalado
    checkFirebaseCLI() {
        try {
            execSync('firebase --version', { stdio: 'pipe' });
            console.log('✓ Firebase CLI encontrado');
            return true;
        } catch (error) {
            console.log('❌ Firebase CLI não encontrado');
            console.log('Instale com: npm install -g firebase-tools');
            return false;
        }
    }

    // Verifica se está logado no Firebase
    checkFirebaseAuth() {
        try {
            const result = execSync('firebase projects:list', { stdio: 'pipe' });
            console.log('✓ Autenticado no Firebase');
            return true;
        } catch (error) {
            console.log('❌ Não autenticado no Firebase');
            console.log('Execute: firebase login');
            return false;
        }
    }

    // Inicializa Firebase se necessário
    initFirebase() {
        if (!fs.existsSync('.firebaserc')) {
            console.log('Inicializando Firebase...');
            try {
                execSync('firebase init hosting --project ' + this.config.firebase.projectId, { stdio: 'inherit' });
                console.log('✓ Firebase inicializado');
            } catch (error) {
                console.error('Erro ao inicializar Firebase:', error.message);
                return false;
            }
        }
        return true;
    }

    // Copia arquivos para a pasta public
    prepareFiles() {
        console.log('Preparando arquivos para deploy...');
        
        const publicDir = this.config.firebase.publicDir;
        
        // Cria pasta public se não existir
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        // Lista de arquivos para copiar
        const filesToCopy = [
            { src: 'styles.css', dest: 'styles.css' },
            { src: 'remote-gallery.js', dest: 'remote-gallery.js' },
            { src: 'gallery.js', dest: 'gallery.js' }
        ];

        filesToCopy.forEach(file => {
            if (fs.existsSync(file.src)) {
                fs.copyFileSync(file.src, path.join(publicDir, file.dest));
                console.log(`✓ Copiado: ${file.src} -> ${file.dest}`);
            }
        });

        // Copia páginas HTML
        const htmlFiles = ['index.html', 'boston.html', 'newyork.html'];
        htmlFiles.forEach(htmlFile => {
            const srcPath = path.join(publicDir, htmlFile);
            if (fs.existsSync(srcPath)) {
                console.log(`✓ HTML já existe: ${htmlFile}`);
            } else {
                console.log(`⚠️  HTML não encontrado: ${htmlFile}`);
            }
        });

        console.log('✓ Arquivos preparados');
    }

    // Executa deploy
    deploy() {
        console.log('Iniciando deploy para Firebase...');
        
        try {
            execSync('firebase deploy --only hosting', { stdio: 'inherit' });
            console.log('✅ Deploy concluído com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro no deploy:', error.message);
            return false;
        }
    }

    // Verifica status do servidor
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.config.server.baseUrl}/health`);
            if (response.ok) {
                console.log('✅ Servidor pessoal está online');
                return true;
            } else {
                throw new Error('Servidor não respondeu');
            }
        } catch (error) {
            console.log('⚠️  Servidor pessoal offline:', error.message);
            console.log('Certifique-se de que o servidor está rodando em:', this.config.server.baseUrl);
            return false;
        }
    }

    // Executa todo o processo de deploy
    async run() {
        console.log('🚀 Iniciando processo de deploy...\n');

        // 1. Verificar Firebase CLI
        if (!this.checkFirebaseCLI()) {
            return false;
        }

        // 2. Verificar autenticação
        if (!this.checkFirebaseAuth()) {
            return false;
        }

        // 3. Inicializar Firebase se necessário
        if (!this.initFirebase()) {
            return false;
        }

        // 4. Preparar arquivos
        this.prepareFiles();

        // 5. Verificar servidor (opcional)
        console.log('\nVerificando servidor pessoal...');
        await this.checkServerStatus();

        // 6. Deploy
        console.log('\nIniciando deploy...');
        return this.deploy();
    }
}

// Função principal
async function main() {
    const deployer = new FirebaseDeployer();
    const success = await deployer.run();
    
    if (success) {
        console.log('\n🎉 Deploy concluído!');
        console.log('Seu site está disponível em: https://seu-projeto.web.app');
    } else {
        console.log('\n❌ Deploy falhou. Verifique os erros acima.');
        process.exit(1);
    }
}

// Executa se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = FirebaseDeployer;



