const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Caminho das mídias
const MEDIA_PATH = 'C:\\Users\\lemuel\\Desktop\\wordpress\\projetos Intercâmbio\\fotos Intercambio';

console.log('=== Conversor de Vídeos iPhone (HEVC -> MP4) ===');

// Verifica se FFmpeg está instalado
try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (e) {
    console.error('❌ FFmpeg não encontrado!');
    console.error('Para converter os vídeos, você precisa instalar o FFmpeg.');
    console.error('1. Baixe em: https://ffmpeg.org/download.html');
    console.error('2. Ou instale via winget: winget install ffmpeg');
    process.exit(1);
}

function convertVideo(filePath) {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);
    const newPath = path.join(dir, `${name}.mp4`);

    // Pula se já existir o MP4 convertido
    if (fs.existsSync(newPath)) {
        return;
    }

    console.log(`Convertendo: ${path.basename(filePath)}...`);
    try {
        // Converte para H.264 MP4 (compatível com web)
        // -movflags +faststart: Permite que o vídeo comece a tocar antes de baixar tudo
        execSync(`ffmpeg -i "${filePath}" -vcodec libx264 -acodec aac -movflags +faststart "${newPath}"`, { stdio: 'inherit' });
        console.log('✓ Convertido com sucesso\n');
    } catch (e) {
        console.error(`❌ Erro ao converter ${path.basename(filePath)}:`, e.message);
    }
}

function processFolder(folderPath) {
    if (!fs.existsSync(folderPath)) return;

    const items = fs.readdirSync(folderPath, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(folderPath, item.name);
        
        if (item.isDirectory()) {
            processFolder(fullPath);
        } else if (item.isFile()) {
            const ext = path.extname(item.name).toLowerCase();
            if (ext === '.mov') {
                convertVideo(fullPath);
            }
        }
    }
}

console.log(`Procurando vídeos .mov em: ${MEDIA_PATH}`);
processFolder(MEDIA_PATH);
console.log('Processamento finalizado! Execute "npm run process-media" para atualizar a galeria.');