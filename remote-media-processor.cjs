const fs = require('fs');
const path = require('path');

class RemoteMediaProcessor {
    constructor(configPath = 'server-config.json') {
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.processedData = {
            boston: { items: [] },
            retorno: { items: [] },
            newyork: { items: [] }
        };
    }

    // Detecta o dispositivo baseado no nome do arquivo
    detectDevice(filename) {
        for (const [deviceName, deviceConfig] of Object.entries(this.config.devices)) {
            for (const pattern of deviceConfig.patterns) {
                if (filename.includes(pattern) || new RegExp(pattern).test(filename)) {
                    return deviceName;
                }
            }
        }
        return 'Desconhecido';
    }

    // Detecta o tipo de mídia
    getMediaType(filename) {
        const ext = path.extname(filename).toLowerCase();
        const videoFormats = ['.mp4', '.mov', '.avi', '.mkv'];
        const imageFormats = ['.jpg', '.jpeg', '.png', '.heic', '.webp'];
        
        if (videoFormats.includes(ext)) {
            return 'video';
        }
        if (imageFormats.includes(ext)) {
            return 'photo';
        }
        return 'unknown';
    }

    // Extrai data do nome do arquivo
    extractDate(filename) {
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

        return null;
    }

    // Gera URL do servidor
    encodeUrlPathSegments(relativePath) {
        return relativePath
            .replace(/\\/g, '/')
            .split('/')
            .map((seg) => encodeURIComponent(seg))
            .join('/');
    }

    /** Prefixo público onde o Apache/Nginx expõe as mídias (ex.: /galeria ou /media/intercambio) */
    getPublicMediaPrefix() {
        const p = this.config.publicMediaPath || '/media/intercambio';
        return p.startsWith('/') ? p : `/${p}`;
    }

    getPublicThumbnailsPrefix() {
        if (this.config.thumbnailsPath && String(this.config.thumbnailsPath).startsWith('/')) {
            return this.config.thumbnailsPath.replace(/\/$/, '');
        }
        return `${this.getPublicMediaPrefix()}/thumbnails`;
    }

    generateServerUrl(relativePath) {
        const baseUrl = (this.config.baseUrl || `http://localhost:${this.config.port}`).replace(/\/$/, '');
        const mediaPath = this.getPublicMediaPrefix();
        return `${baseUrl}${mediaPath}/${this.encodeUrlPathSegments(relativePath)}`;
    }

    // Gera URL do thumbnail
    generateThumbnailUrl(relativePath) {
        const baseUrl = (this.config.baseUrl || `http://localhost:${this.config.port}`).replace(/\/$/, '');
        const thumbnailsPath = this.getPublicThumbnailsPrefix();
        return `${baseUrl}${thumbnailsPath}/${this.encodeUrlPathSegments(relativePath)}`;
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
        const relativePath = path.relative(this.config.mediaPath, filePath);
        const stats = fs.statSync(filePath);
        
        const mediaItem = {
            src: this.generateServerUrl(relativePath),
            thumb: this.generateThumbnailUrl(relativePath),
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
            th: 300,
            localPath: filePath, // Caminho local para referência
            serverPath: relativePath // Caminho no servidor
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
        console.log('Iniciando processamento das mídias para servidor remoto...');
        
        // Processa Boston
        const bostonPath = path.join(this.config.mediaPath, 'Boston');
        if (fs.existsSync(bostonPath)) {
            console.log('Processando Boston...');
            this.processFolder(bostonPath, 'boston');
        }

        // Processa New York
        const newyorkPath = path.join(this.config.mediaPath, 'NewYork');
        if (fs.existsSync(newyorkPath)) {
            console.log('Processando New York...');
            this.processFolder(newyorkPath, 'newyork');
        }

        // Processa Retorno
        const retornoPath = path.join(this.config.mediaPath, 'Retorno');
        if (fs.existsSync(retornoPath)) {
            console.log('Processando Retorno...');
            this.processFolder(retornoPath, 'retorno');
        }

        // Ordena por data
        this.processedData.boston.items.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.processedData.newyork.items.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.processedData.retorno.items.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log(`Processamento concluído!`);
        console.log(`Boston: ${this.processedData.boston.items.length} itens`);
        console.log(`New York: ${this.processedData.newyork.items.length} itens`);
        console.log(`Retorno: ${this.processedData.retorno.items.length} itens`);

        return this.processedData;
    }

    // Salva os dados processados
    saveProcessedData() {
        // Cria diretório public se não existir
        const publicDir = 'public';
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        // Cria diretório data dentro de public
        const dataDir = path.join(publicDir, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Salva Boston
        fs.writeFileSync(
            path.join(dataDir, 'boston.json'), 
            JSON.stringify(this.processedData.boston, null, 2)
        );

        // Salva New York
        fs.writeFileSync(
            path.join(dataDir, 'newyork.json'), 
            JSON.stringify(this.processedData.newyork, null, 2)
        );

        fs.writeFileSync(
            path.join(dataDir, 'retorno.json'),
            JSON.stringify(this.processedData.retorno, null, 2)
        );

        console.log('Dados salvos em data/boston.json, newyork.json e retorno.json');
    }

    // Gera estatísticas
    generateStats() {
        const stats = {
            total: 0,
            byDevice: {},
            byType: {},
            byCity: {
                boston: 0,
                newyork: 0,
                retorno: 0
            },
            totalSize: 0
        };

        for (const city of ['boston', 'newyork', 'retorno']) {
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

    // Gera arquivo de configuração para o frontend
    generateFrontendConfig() {
        const baseUrl = (this.config.baseUrl || `http://localhost:${this.config.port}`).replace(/\/$/, '');
        const publicPrefix = this.getPublicMediaPrefix().replace(/^\//, '');
        const frontendConfig = {
            mediaBaseUrl: `${baseUrl}/${publicPrefix}`,
            useThumbnails: true,
            server: {
                baseUrl: `http://localhost:${this.config.port}`,
                mediaPath: this.config.mediaPath,
                thumbnailsPath: this.config.thumbnailsPath
            },
            devices: {
                "Samsung A50": {
                    "name": "Samsung Galaxy A50",
                    "icon": "📱",
                    "color": "#1f2937"
                },
                "iPhone 16": {
                    "name": "iPhone 16",
                    "icon": "📱",
                    "color": "#374151"
                },
                "Desconhecido": {
                    "name": "Dispositivo Desconhecido",
                    "icon": "📷",
                    "color": "#6b7280"
                }
            },
            media: {
                supportedFormats: {
                    images: [".jpg", ".jpeg", ".png", ".heic", ".webp"],
                    videos: [".mp4", ".mov", ".avi", ".mkv"]
                },
                thumbnailSize: {
                    width: 400,
                    height: 300,
                    quality: 80
                }
            }
        };

        const publicDir = 'public';
        fs.writeFileSync(
            path.join(publicDir, 'config.json'),
            JSON.stringify(frontendConfig, null, 2)
        );

        console.log('Configuração do frontend salva em public/config.json');
    }
}

// Função principal
async function main() {
    const processor = new RemoteMediaProcessor();
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
    processor.generateFrontendConfig();
}

// Executa se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = RemoteMediaProcessor;
