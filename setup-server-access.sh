#!/bin/bash

# Script para configurar acesso web às mídias do intercâmbio
# Execute no servidor: bash setup-server-access.sh

echo "🚀 Configurando acesso web às mídias do intercâmbio..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Execute como root: sudo bash setup-server-access.sh"
    exit 1
fi

# Detectar se é Apache ou Nginx
if command -v apache2 &> /dev/null; then
    SERVER="apache"
    echo "✅ Apache detectado"
elif command -v nginx &> /dev/null; then
    SERVER="nginx"
    echo "✅ Nginx detectado"
else
    echo "❌ Apache ou Nginx não encontrado"
    exit 1
fi

# 1. Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p /var/www/html/media
mkdir -p /var/www/html/intercambio

# 2. Criar link simbólico para mídias
echo "🔗 Criando link simbólico para mídias..."
if [ -L /var/www/html/media/intercambio ]; then
    echo "⚠️  Link já existe, removendo..."
    rm /var/www/html/media/intercambio
fi

ln -s /mnt/fotosIntercambio /var/www/html/media/intercambio
echo "✅ Link criado: /var/www/html/media/intercambio -> /mnt/fotosIntercambio"

# 3. Definir permissões
echo "🔐 Configurando permissões..."
chown -R www-data:www-data /var/www/html/media
chmod -R 755 /var/www/html/media
chmod -R 755 /mnt/fotosIntercambio

# 4. Configurar servidor web
if [ "$SERVER" = "apache" ]; then
    echo "🔧 Configurando Apache..."
    
    # Criar configuração do site
    cat > /etc/apache2/sites-available/intercambio.conf << 'EOF'
<VirtualHost *:80>
    ServerName www.portalmantec.com.br
    DocumentRoot /var/www/html
    
    # Configuração para mídias
    Alias /media/intercambio /mnt/fotosIntercambio
    
    <Directory /mnt/fotosIntercambio>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
        
        # CORS Headers
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, HEAD, OPTIONS"
        Header always set Access-Control-Allow-Headers "Range, Content-Type"
        
        # Cache para mídias
        ExpiresActive On
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType video/mp4 "access plus 1 year"
        ExpiresByType video/quicktime "access plus 1 year"
    </Directory>
    
    # Configuração para o site
    Alias /intercambio /var/www/html/intercambio
    
    <Directory /var/www/html/intercambio>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>
</VirtualHost>
EOF

    # Ativar site e módulos
    a2ensite intercambio.conf
    a2enmod headers
    a2enmod expires
    
    # Reiniciar Apache
    systemctl restart apache2
    echo "✅ Apache configurado e reiniciado"

elif [ "$SERVER" = "nginx" ]; then
    echo "🔧 Configurando Nginx..."
    
    # Criar configuração do site
    cat > /etc/nginx/sites-available/intercambio << 'EOF'
server {
    listen 80;
    server_name www.portalmantec.com.br;
    root /var/www/html;
    index index.html;
    
    # Configuração para mídias
    location /media/intercambio/ {
        alias /mnt/fotosIntercambio/;
        
        # CORS Headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS";
        add_header Access-Control-Allow-Headers "Range, Content-Type";
        
        # Cache
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Configuração para o site
    location /intercambio/ {
        alias /var/www/html/intercambio/;
        try_files $uri $uri/ =404;
    }
}
EOF

    # Ativar site
    ln -sf /etc/nginx/sites-available/intercambio /etc/nginx/sites-enabled/
    
    # Testar configuração
    nginx -t
    if [ $? -eq 0 ]; then
        systemctl restart nginx
        echo "✅ Nginx configurado e reiniciado"
    else
        echo "❌ Erro na configuração do Nginx"
        exit 1
    fi
fi

# 5. Verificar configuração
echo "🔍 Verificando configuração..."

# Verificar link simbólico
if [ -L /var/www/html/media/intercambio ]; then
    echo "✅ Link simbólico criado corretamente"
else
    echo "❌ Erro ao criar link simbólico"
fi

# Verificar permissões
if [ -r /mnt/fotosIntercambio ]; then
    echo "✅ Permissões de leitura OK"
else
    echo "❌ Problema com permissões de leitura"
fi

# Verificar se o servidor está rodando
if [ "$SERVER" = "apache" ]; then
    if systemctl is-active --quiet apache2; then
        echo "✅ Apache está rodando"
    else
        echo "❌ Apache não está rodando"
    fi
elif [ "$SERVER" = "nginx" ]; then
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx está rodando"
    else
        echo "❌ Nginx não está rodando"
    fi
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Faça upload dos arquivos do site para /var/www/html/intercambio/"
echo "2. Teste as URLs:"
echo "   - https://www.portalmantec.com.br/intercambio/"
echo "   - https://www.portalmantec.com.br/media/intercambio/"
echo ""
echo "🔍 Para verificar se está funcionando:"
echo "curl -I http://localhost/media/intercambio/Boston/Harvard/"
echo ""
echo "📊 Para ver logs de erro:"
if [ "$SERVER" = "apache" ]; then
    echo "sudo tail -f /var/log/apache2/error.log"
else
    echo "sudo tail -f /var/log/nginx/error.log"
fi



