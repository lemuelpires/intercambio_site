const fs = require('fs');
const path = require('path');

// Script para testar o setup sem processar todas as mídias
console.log('🧪 Testando configuração do sistema...\n');

// 1. Verifica se as dependências estão instaladas
console.log('1. Verificando dependências...');
try {
    require('sharp');
    console.log('✓ Sharp instalado');
} catch (error) {
    console.log('⚠️  Sharp não encontrado - thumbnails podem não funcionar');
}

// 2. Verifica se a pasta de mídias existe
console.log('\n2. Verificando pasta de mídias...');
const mediaPath = 'C:\\Users\\lemuel\\Desktop\\wordpress\\projetos Intercâmbio\\fotos Intercambio';
if (fs.existsSync(mediaPath)) {
    console.log('✓ Pasta de mídias encontrada');
    
    // Conta arquivos de exemplo
    let fileCount = 0;
    const countFiles = (dir) => {
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
                if (item.isDirectory()) {
                    countFiles(path.join(dir, item.name));
                } else if (item.isFile()) {
                    const ext = path.extname(item.name).toLowerCase();
                    if (['.jpg', '.jpeg', '.png', '.heic', '.webp', '.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
                        fileCount++;
                    }
                }
            }
        } catch (error) {
            // Ignora erros de permissão
        }
    };
    
    countFiles(mediaPath);
    console.log(`✓ Encontrados ${fileCount} arquivos de mídia`);
} else {
    console.log('❌ Pasta de mídias não encontrada');
    console.log('   Verifique o caminho em config.json');
}

// 3. Verifica estrutura do projeto
console.log('\n3. Verificando estrutura do projeto...');
const requiredFiles = [
    'index.html',
    'boston.html',
    'newyork.html',
    'styles.css',
    'gallery.js',
    'media-processor.js',
    'copy-media.js',
    'generate-thumbnails.js',
    'config.json',
    'package.json'
];

let missingFiles = [];
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✓ ${file}`);
    } else {
        console.log(`❌ ${file} - FALTANDO`);
        missingFiles.push(file);
    }
});

// 4. Cria pasta de mídias se não existir
console.log('\n4. Preparando estrutura de pastas...');
const mediaDir = './media';
const thumbnailsDir = './media/thumbnails';

if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
    console.log('✓ Pasta media/ criada');
}

if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
    console.log('✓ Pasta media/thumbnails/ criada');
}

// 5. Cria dados de exemplo se não existirem
console.log('\n5. Verificando dados de exemplo...');
if (!fs.existsSync('data/boston.json') || !fs.existsSync('data/newyork.json')) {
    const exampleData = {
        boston: {
            items: [
                {
                    src: "https://images.unsplash.com/photo-1560121168-5c4f88e1d2c3?q=80&w=1600&auto=format&fit=crop",
                    thumb: "https://images.unsplash.com/photo-1560121168-5c4f88e1d2c3?q=60&w=600&auto=format&fit=crop",
                    filename: "boston_skyline.jpg",
                    device: "Samsung A50",
                    type: "photo",
                    category: "diversas",
                    size: 1024000,
                    date: new Date().toISOString(),
                    title: "Skyline de Boston",
                    w: 1600,
                    h: 1067,
                    tw: 600,
                    th: 400
                }
            ]
        },
        newyork: {
            items: [
                {
                    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop",
                    thumb: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=60&w=600&auto=format&fit=crop",
                    filename: "manhattan_view.jpg",
                    device: "iPhone 16",
                    type: "photo",
                    category: "Downtown",
                    size: 1200000,
                    date: new Date().toISOString(),
                    title: "Vista de Manhattan",
                    w: 1600,
                    h: 1067,
                    tw: 600,
                    th: 400
                }
            ]
        }
    };

    if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
    }

    fs.writeFileSync('data/boston.json', JSON.stringify(exampleData.boston, null, 2));
    fs.writeFileSync('data/newyork.json', JSON.stringify(exampleData.newyork, null, 2));
    console.log('✓ Dados de exemplo criados');
}

// 6. Resumo
console.log('\n========================================');
console.log('           RESUMO DO TESTE');
console.log('========================================');

if (missingFiles.length === 0) {
    console.log('✅ Todos os arquivos necessários estão presentes');
} else {
    console.log('❌ Arquivos faltando:', missingFiles.join(', '));
}

console.log('\nPara continuar:');
console.log('1. Execute: npm run copy-media');
console.log('2. Execute: npm run process-media');
console.log('3. Execute: npm run generate-thumbnails');
console.log('4. Execute: npm run dev');
console.log('\nOu execute: install.bat para instalação automática');



