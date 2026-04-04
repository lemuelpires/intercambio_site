const fs = require('fs');
const path = require('path');

class MediaCopier {
    constructor(sourcePath, targetPath) {
        this.sourcePath = sourcePath;
        this.targetPath = targetPath;
        this.copiedCount = 0;
        this.skippedCount = 0;
        this.errorCount = 0;
    }

    // Cria diretório se não existir
    ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    // Copia arquivo com tratamento de erro
    async copyFile(source, target) {
        return new Promise((resolve) => {
            const targetDir = path.dirname(target);
            this.ensureDir(targetDir);

            const readStream = fs.createReadStream(source);
            const writeStream = fs.createWriteStream(target);

            readStream.on('error', (err) => {
                writeStream.destroy();
                readStream.destroy();
                console.error(`Erro ao ler ${source}:`, err.message);
                this.errorCount++;
                resolve(false);
            });

            writeStream.on('error', (err) => {
                readStream.destroy();
                writeStream.destroy();
                console.error(`Erro ao escrever ${target}:`, err.message);
                this.errorCount++;
                resolve(false);
            });

            writeStream.on('finish', () => {
                this.copiedCount++;
                resolve(true);
            });

            readStream.pipe(writeStream);
        });
    }

    // Processa uma pasta específica
    async processFolder(folderPath, city) {
        try {
            const items = fs.readdirSync(folderPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(folderPath, item.name);
                
                if (item.isDirectory()) {
                    // Processa subpastas recursivamente
                    await this.processFolder(fullPath, city);
                } else if (item.isFile()) {
                    // Copia arquivo de mídia
                    await this.copyMediaFile(fullPath, city, path.basename(folderPath));
                }
            }
        } catch (error) {
            console.error(`Erro ao processar pasta ${folderPath}:`, error.message);
            this.errorCount++;
        }
    }

    // Copia um arquivo de mídia individual
    async copyMediaFile(filePath, city, category) {
        const filename = path.basename(filePath);
        const relativePath = path.relative(this.sourcePath, filePath);
        const targetPath = path.join(this.targetPath, 'media', relativePath);
        
        // Verifica se o arquivo já existe
        if (fs.existsSync(targetPath)) {
            this.skippedCount++;
            return;
        }

        // Copia o arquivo
        const success = await this.copyFile(filePath, targetPath);
        
        if (success) {
            console.log(`✓ Copiado: ${relativePath}`);
        }
    }

    // Processa toda a estrutura de mídia
    async copyAll() {
        console.log('Iniciando cópia das mídias...');
        console.log(`Origem: ${this.sourcePath}`);
        console.log(`Destino: ${this.targetPath}`);
        
        // Cria diretório de destino
        this.ensureDir(this.targetPath);
        this.ensureDir(path.join(this.targetPath, 'media'));
        this.ensureDir(path.join(this.targetPath, 'media', 'thumbnails'));

        // Processa Boston
        const bostonPath = path.join(this.sourcePath, 'Boston');
        if (fs.existsSync(bostonPath)) {
            console.log('\nCopiando Boston...');
            await this.processFolder(bostonPath, 'boston');
        }

        // Processa New York
        const newyorkPath = path.join(this.sourcePath, 'NewYork');
        if (fs.existsSync(newyorkPath)) {
            console.log('\nCopiando New York...');
            await this.processFolder(newyorkPath, 'newyork');
        }

        console.log('\n=== RESUMO DA CÓPIA ===');
        console.log(`Arquivos copiados: ${this.copiedCount}`);
        console.log(`Arquivos ignorados (já existem): ${this.skippedCount}`);
        console.log(`Erros: ${this.errorCount}`);
    }
}

// Função principal
async function main() {
    const sourcePath = 'C:\\Users\\lemuel\\Desktop\\wordpress\\projetos Intercâmbio\\fotos Intercambio';
    const targetPath = process.cwd(); // Diretório atual do projeto
    
    const copier = new MediaCopier(sourcePath, targetPath);
    await copier.copyAll();
}

// Executa se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = MediaCopier;



