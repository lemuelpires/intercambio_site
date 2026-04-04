const fs = require('fs');
const path = require('path');

class MediaProcessor {
    constructor(mediaPath) {
        this.mediaPath = mediaPath;
        this.processedData = {
            boston: { items: [] },
            newyork: { items: [] }
        };
    }

    // Detecta o dispositivo baseado no nome do arquivo ou metadados
    detectDevice(filename) {
        // Samsung A50 geralmente cria arquivos com padrões específicos
        if (filename.includes('SAMSUNG') || filename.includes('A50') || 
            filename.match(/^[0-9]{8}_[0-9]{6}/)) {
            return 'Samsung A50';
        }
        // iPhone 16 geralmente cria arquivos com padrões específicos
        if (filename.includes('IMG_') || filename.includes('VID_') || 
            filename.includes('iPhone') || filename.includes('16')) {
            return 'iPhone 16';
        }
        return 'Desconhecido';
    }

    // Detecta o tipo de mídia
    getMediaType(filename) {
        const ext = path.extname(filename).toLowerCase();
        if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
            return 'video';
        }
        if (['.jpg', '.jpeg', '.png', '.heic', '.webp'].includes(ext)) {
            return 'photo';
        }
        return 'unknown';
    }

    // Extrai data do nome do arquivo
    extractDate(filename) {
        // Padrões comuns de nomes de arquivos de câmeras
        const patterns = [
            /(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, // YYYYMMDD_HHMMSS
            /IMG_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, // IMG_YYYYMMDD_HHMMSS
            /VID_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/, // VID_YYYYMMDD_HHMMSS
            /(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/, // YYYY-MM-DD_HH-MM-SS
        ];

        for (const pattern of patterns) {
            const match = filename.match(pattern);
            if (match) {
                const [, year, month, day, hour, minute, second] = match;
                const y = parseInt(year, 10);
                const m = parseInt(month, 10);
                const d = parseInt(day, 10);
                const h = parseInt(hour, 10);
                const min = parseInt(minute, 10);
                const sec = parseInt(second, 10);
                return new Date(y, m - 1, d, h, min, sec);
            }
        }

        // Se não conseguir extrair, usa a data de modificação do arquivo
        return null;
    }

    // Processa uma pasta específica
    processFolder(folderPath, city) {
        try {
            const items = fs.readdirSync(folderPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(folderPath, item.name);
                
                if (item.isDirectory()) {
                    // Processa subpastas recursivamente
                    this.processFolder(fullPath, city);
                } else if (item.isFile()) {
                    // Processa arquivo de mídia
                    this.processMediaFile(fullPath, city, path.basename(folderPath));
                }
            }
        } catch (error) {
            console.error(`Erro ao processar pasta ${folderPath}:`, error.message);
        }
    }

    // Processa um arquivo de mídia individual
    processMediaFile(filePath, city, category) {
        const filename = path.basename(filePath);
        const relativePath = path.relative(this.mediaPath, filePath);
        const stats = fs.statSync(filePath);
        
        const relPosix = relativePath.replace(/\\/g, '/');
        const mediaItem = {
            src: `media/${relPosix}`,
            thumb: `media/thumbnails/${relPosix}`,
            filename: filename,
            device: this.detectDevice(filename),
            type: this.getMediaType(filename),
            category: category,
            size: stats.size,
            date: this.extractDate(filename) || stats.mtime,
            title: this.generateTitle(filename, category),
            w: 1920, // Será atualizado quando processarmos as imagens
            h: 1080,
            tw: 400,
            th: 300
        };

        this.processedData[city].items.push(mediaItem);
    }

    // Gera título baseado no nome do arquivo e categoria
    generateTitle(filename, category) {
        const baseName = path.parse(filename).name;
        const categoryMap = {
            'Acomodações': 'Acomodações',
            'Cientistas Cristãos': 'Igreja dos Cientistas Cristãos',
            'Começo': 'Início da Jornada',
            'Desembarque em Boston': 'Chegada em Boston',
            'diversas': 'Momentos Diversos',
            'EC College': 'EC College',
            'Freedom Trail': 'Freedom Trail',
            'Harvard': 'Universidade de Harvard',
            'Igreja no Quincy': 'Igreja em Quincy',
            'M.I.T': 'MIT',
            'Memorial de Guerra': 'Memorial de Guerra',
            'Parque': 'Parque',
            'Partida': 'Partida',
            'Central Park': 'Central Park',
            'Downtown': 'Downtown',
            'Empire State Building': 'Empire State Building',
            'Estatua da Liberdade': 'Estátua da Liberdade',
            'Memorial world Trade Center': 'Memorial do World Trade Center',
            'Pier': 'Pier',
            'Ponte': 'Ponte',
            'times square': 'Times Square',
            'Videos': 'Vídeos',
            'Viagem': 'Viagem',
            'Retorno': 'Retorno'
        };

        const categoryTitle = categoryMap[category] || category;
        return `${categoryTitle} - ${baseName}`;
    }

    // Processa toda a estrutura de mídia
    async processAll() {
        console.log('Iniciando processamento das mídias...');
        
        // Processa Boston
        const bostonPath = path.join(this.mediaPath, 'Boston');
        if (fs.existsSync(bostonPath)) {
            console.log('Processando Boston...');
            this.processFolder(bostonPath, 'boston');
        }

        // Processa New York
        const newyorkPath = path.join(this.mediaPath, 'NewYork');
        if (fs.existsSync(newyorkPath)) {
            console.log('Processando New York...');
            this.processFolder(newyorkPath, 'newyork');
        }

        // Ordena por data
        this.processedData.boston.items.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.processedData.newyork.items.sort((a, b) => new Date(b.date) - new Date(a.date));

        console.log(`Processamento concluído!`);
        console.log(`Boston: ${this.processedData.boston.items.length} itens`);
        console.log(`New York: ${this.processedData.newyork.items.length} itens`);

        return this.processedData;
    }

    // Salva os dados processados
    saveProcessedData() {
        const dataDir = 'data';
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(
            path.join(dataDir, 'boston.json'),
            JSON.stringify(this.processedData.boston, null, 2)
        );

        fs.writeFileSync(
            path.join(dataDir, 'newyork.json'),
            JSON.stringify(this.processedData.newyork, null, 2)
        );

        console.log('Dados salvos em data/boston.json e data/newyork.json');
    }

    // Gera estatísticas
    generateStats() {
        const stats = {
            total: 0,
            byDevice: {},
            byType: {},
            byCity: {
                boston: 0,
                newyork: 0
            },
            totalSize: 0
        };

        for (const city of ['boston', 'newyork']) {
            for (const item of this.processedData[city].items) {
                stats.total++;
                stats.byCity[city]++;
                stats.totalSize += item.size;

                // Por dispositivo
                if (!stats.byDevice[item.device]) {
                    stats.byDevice[item.device] = 0;
                }
                stats.byDevice[item.device]++;

                // Por tipo
                if (!stats.byType[item.type]) {
                    stats.byType[item.type] = 0;
                }
                stats.byType[item.type]++;
            }
        }

        return stats;
    }
}

// Função principal
async function main() {
    const mediaPath = 'C:\\Users\\lemuel\\Desktop\\wordpress\\projetos Intercâmbio\\fotos Intercambio';
    
    const processor = new MediaProcessor(mediaPath);
    await processor.processAll();
    
    const stats = processor.generateStats();
    console.log('\n=== ESTATÍSTICAS ===');
    console.log(`Total de mídias: ${stats.total}`);
    console.log(`Tamanho total: ${(stats.totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`);
    console.log('\nPor dispositivo:');
    Object.entries(stats.byDevice).forEach(([device, count]) => {
        console.log(`  ${device}: ${count}`);
    });
    console.log('\nPor tipo:');
    Object.entries(stats.byType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
    });
    console.log('\nPor cidade:');
    Object.entries(stats.byCity).forEach(([city, count]) => {
        console.log(`  ${city}: ${count}`);
    });

    processor.saveProcessedData();
}

// Executa se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = MediaProcessor;



