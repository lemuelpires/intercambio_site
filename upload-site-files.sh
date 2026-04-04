#!/bin/bash

# Script para fazer upload dos arquivos do site para o servidor
# Execute localmente: bash upload-site-files.sh

echo "🚀 Fazendo upload dos arquivos do site..."

# Verificar se a pasta public existe
if [ ! -d "public" ]; then
    echo "❌ Pasta 'public' não encontrada. Execute primeiro: npm run process-remote"
    exit 1
fi

# Configurações do servidor
SERVER="www.portalmantec.com.br"
USER="lemuel"
REMOTE_PATH="/var/www/html/intercambio"

echo "📁 Enviando arquivos para $SERVER:$REMOTE_PATH"

# Fazer upload usando rsync
rsync -avz --progress public/ $USER@$SERVER:$REMOTE_PATH/

if [ $? -eq 0 ]; then
    echo "✅ Upload concluído com sucesso!"
    echo ""
    echo "🌐 URLs disponíveis:"
    echo "   - https://www.portalmantec.com.br/intercambio/"
    echo "   - https://www.portalmantec.com.br/intercambio/boston.html"
    echo "   - https://www.portalmantec.com.br/intercambio/newyork.html"
    echo ""
    echo "🔍 Para testar:"
    echo "   - Acesse: https://www.portalmantec.com.br/intercambio/test-upload.html"
else
    echo "❌ Erro no upload. Verifique a conexão e permissões."
    exit 1
fi



