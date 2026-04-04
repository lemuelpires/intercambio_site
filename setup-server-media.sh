#!/bin/bash

# Script para configurar servidor de mídias
# Execute no servidor: sudo bash setup-server-media.sh

echo "🚀 Configurando servidor de mídias para intercâmbio..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Execute como root: sudo bash setup-server-media.sh"
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
    cat > /etc/apache2/sites-available/intercambio-media.conf << 'EOF'
<VirtualHost *:80>
    ServerName www.portalmantec.com.br
    DocumentRoot /var/www/html
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/intercambio_error.log
    CustomLog ${APACHE_LOG_DIR}/intercambio_access.log combined
    
    # Configuração para mídias
    Alias /media/intercambio /mnt/fotosIntercambio
    
    <Directory /mnt/fotosIntercambio>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
        
        # CORS Headers
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, HEAD, OPTIONS"
        Header always set Access-Control-Allow-Headers "Range, Content-Type, Accept, Origin, X-Requested-With"
        
        # Cache otimizado
        ExpiresActive On
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType image/webp "access plus 1 year"
        ExpiresByType video/mp4 "access plus 1 year"
        ExpiresByType video/quicktime "access plus 1 year"
        ExpiresByType video/x-msvideo "access plus 1 year"
        
        # Compressão
        <IfModule mod_deflate.c>
            SetOutputFilter DEFLATE
            SetEnvIfNoCase Request_URI \
                \.(?:gif|jpe?g|png)$ no-gzip dont-vary
            SetEnvIfNoCase Request_URI \
                \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
        </IfModule>
    </Directory>
</VirtualHost>
EOF

    # Ativar site e módulos
    a2ensite intercambio-media.conf
    a2enmod headers
    a2enmod expires
    a2enmod deflate
    
    # Reiniciar Apache
    systemctl restart apache2
    echo "✅ Apache configurado e reiniciado"

elif [ "$SERVER" = "nginx" ]; then
    echo "🔧 Configurando Nginx..."
    
    # Criar configuração do site
    cat > /etc/nginx/sites-available/intercambio-media << 'EOF'
server {
    listen 80;
    server_name www.portalmantec.com.br;
    root /var/www/html;
    
    # Logs
    access_log /var/log/nginx/intercambio_access.log;
    error_log /var/log/nginx/intercambio_error.log;
    
    # Configuração para mídias
    location /media/intercambio/ {
        alias /mnt/fotosIntercambio/;
        
        # CORS Headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS";
        add_header Access-Control-Allow-Headers "Range, Content-Type, Accept, Origin, X-Requested-With";
        
        # Cache
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Compressão
        gzip on;
        gzip_types image/jpeg image/png image/gif video/mp4;
    }
}
EOF

    # Ativar site
    ln -sf /etc/nginx/sites-available/intercambio-media /etc/nginx/sites-enabled/
    
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

# 6. Teste de conectividade
echo "🧪 Testando conectividade..."
if curl -s -I http://localhost/media/intercambio/Boston/Harvard/ | grep -q "200 OK"; then
    echo "✅ Servidor de mídias funcionando"
else
    echo "⚠️  Servidor de mídias pode ter problemas"
fi

echo ""
echo "🎉 Configuração do servidor concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o Firebase: firebase init hosting"
echo "2. Faça deploy: firebase deploy"
echo "3. Teste as URLs:"
echo "   - https://seu-projeto.web.app"
echo "   - https://www.portalmantec.com.br/media/intercambio/"
echo ""
echo "🔍 Para verificar se está funcionando:"
echo "curl -I http://localhost/media/intercambio/Boston/Harvard/"
echo ""
echo "📊 Para ver logs:"
if [ "$SERVER" = "apache" ]; then
    echo "sudo tail -f /var/log/apache2/intercambio_access.log"
else
    echo "sudo tail -f /var/log/nginx/intercambio_access.log"
fi



