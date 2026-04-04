const fs = require('fs');
const path = require('path');

class ThumbnailGenerator {
    constructor(mediaPath) {
        this.mediaPath = mediaPath;
        this.thumbnailsPath = path.join(mediaPath, 'thumbnails');
        this.processedCount = 0;
        this.skippedCount = 0;
        this.errorCount = 0;
    }

    // Cria diretório se não existir
    ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    // Verifica se é uma imagem
    isImage(filename) {
        const ext = path.extname(filename).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.heic', '.webp'].includes(ext);
    }

    // Gera thumbnail usando Canvas (se disponível) ou fallback
    async generateThumbnail(sourcePath, targetPath, width = 400, height = 300) {
        try {
            // Tenta usar sharp se disponível
            if (this.canUseSharp()) {
                return await this.generateThumbnailSharp(sourcePath, targetPath, width, height);
            }
            
            // Fallback: copia o arquivo original como thumbnail
            return await this.copyAsThumbnail(sourcePath, targetPath);
        } catch (error) {
            console.error(`Erro ao gerar thumbnail para ${sourcePath}:`, error.message);
            this.errorCount++;
            return false;
        }
    }

    // Verifica se sharp está disponível
    canUseSharp() {
        try {
            require('sharp');
            return true;
        } catch (error) {
            return false;
        }
    }

    // Gera thumbnail usando Sharp
    async generateThumbnailSharp(sourcePath, targetPath, width, height) {
        const sharp = require('sharp');
        
        await sharp(sourcePath)
            .resize(width, height, { 
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80 })
            .toFile(targetPath);
        
        return true;
    }

    // Fallback: copia arquivo como thumbnail
    async copyAsThumbnail(sourcePath, targetPath) {
        return new Promise((resolve) => {
            const readStream = fs.createReadStream(sourcePath);
            const writeStream = fs.createWriteStream(targetPath);

            readStream.on('error', (err) => {
                writeStream.destroy();
                readStream.destroy();
                console.error(`Erro ao ler ${sourcePath}:`, err.message);
                this.errorCount++;
                resolve(false);
            });

            writeStream.on('error', (err) => {
                readStream.destroy();
                writeStream.destroy();
                console.error(`Erro ao escrever ${targetPath}:`, err.message);
                this.errorCount++;
                resolve(false);
            });

            writeStream.on('finish', () => {
                resolve(true);
            });

            readStream.pipe(writeStream);
        });
    }

    // Processa uma pasta específica
    async processFolder(folderPath) {
        try {
            const items = fs.readdirSync(folderPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(folderPath, item.name);
                
                if (item.isDirectory()) {
                    // Processa subpastas recursivamente
                    await this.processFolder(fullPath);
                } else if (item.isFile() && this.isImage(item.name)) {
                    // Gera thumbnail para imagem
                    await this.processImage(fullPath);
                }
            }
        } catch (error) {
            console.error(`Erro ao processar pasta ${folderPath}:`, error.message);
            this.errorCount++;
        }
    }

    // Processa uma imagem individual
    async processImage(imagePath) {
        const filename = path.basename(imagePath);
        const relativePath = path.relative(this.mediaPath, imagePath);
        const thumbnailPath = path.join(this.thumbnailsPath, relativePath);
        this.ensureDir(path.dirname(thumbnailPath));

        // Verifica se o thumbnail já existe
        if (fs.existsSync(thumbnailPath)) {
            this.skippedCount++;
            return;
        }

        // Gera o thumbnail
        const success = await this.generateThumbnail(imagePath, thumbnailPath);
        
        if (success) {
            this.processedCount++;
            console.log(`✓ Thumbnail gerado: ${filename}`);
        }
    }

    // Processa toda a estrutura de mídia
    async generateAll() {
        console.log('Iniciando geração de thumbnails...');
        
        // Cria diretório de thumbnails
        this.ensureDir(this.thumbnailsPath);

        // Processa todas as pastas de mídia
        const mediaFolders = ['Boston', 'NewYork'];
        
        for (const folder of mediaFolders) {
            const folderPath = path.join(this.mediaPath, folder);
            if (fs.existsSync(folderPath)) {
                console.log(`\nProcessando ${folder}...`);
                await this.processFolder(folderPath);
            }
        }

        console.log('\n=== RESUMO DOS THUMBNAILS ===');
        console.log(`Thumbnails gerados: ${this.processedCount}`);
        console.log(`Thumbnails ignorados (já existem): ${this.skippedCount}`);
        console.log(`Erros: ${this.errorCount}`);
    }
}

// Função principal
async function main() {
    const mediaPath = path.join(process.cwd(), 'media');
    
    if (!fs.existsSync(mediaPath)) {
        console.error('Pasta de mídia não encontrada. Execute primeiro o copy-media.js');
        return;
    }
    
    const generator = new ThumbnailGenerator(mediaPath);
    await generator.generateAll();
}

// Executa se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = ThumbnailGenerator;



