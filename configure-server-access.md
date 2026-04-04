# Configuração de Acesso Web - Servidor

## 📁 Estrutura Atual no Servidor

```
/mnt/fotosIntercambio/
├── Boston/
│   ├── Acomodações/
│   ├── Cientistas Cristãos/
│   ├── Começo/
│   ├── Desembarque em Boston/
│   ├── diversas/
│   ├── EC College/
│   ├── Freedom Trail/
│   ├── Harvard/
│   ├── Igreja no Quincy/
│   ├── Memorial de Guerra/
│   ├── M.I.T/
│   ├── Parque/
│   ├── Partida/
│   ├── Passeio shopping/
│   ├── Pier/
│   ├── Pizza em estabelecimento na John Adams/
│   ├── Primeiro Tratejo à escola/
│   ├── Proximidades da escola/
│   ├── Quincy Center/
│   ├── Ruas de Boston/
│   ├── Suprema Corte Michigan/
│   └── Videos/
├── NewYork/
│   ├── Central Park/
│   ├── Downtown/
│   ├── Empire State Building/
│   ├── Estatua da Liberdade/
│   ├── Memorial world Trade Center/
│   ├── Pier/
│   ├── Ponte/
│   ├── times square/
│   └── Viagem/
└── Retorno/
```

## 🔧 Configuração do Apache

### 1. Criar Link Simbólico
```bash
# No servidor, execute:
sudo ln -s /mnt/fotosIntercambio /var/www/html/media/intercambio
```

### 2. Configurar Virtual Host
Crie o arquivo `/etc/apache2/sites-available/intercambio.conf`:

```apache
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
```

### 3. Ativar Site
```bash
# Ativar o site
sudo a2ensite intercambio.conf

# Ativar módulos necessários
sudo a2enmod headers
sudo a2enmod expires

# Reiniciar Apache
sudo systemctl restart apache2
```

## 🔧 Configuração do Nginx

### 1. Criar Link Simbólico
```bash
# No servidor, execute:
sudo ln -s /mnt/fotosIntercambio /var/www/html/media/intercambio
```

### 2. Configurar Virtual Host
Crie o arquivo `/etc/nginx/sites-available/intercambio`:

```nginx
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
```

### 3. Ativar Site
```bash
# Ativar o site
sudo ln -s /etc/nginx/sites-available/intercambio /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 📋 Comandos para Executar

### 1. Criar Estrutura de Diretórios
```bash
# Criar diretórios necessários
sudo mkdir -p /var/www/html/media
sudo mkdir -p /var/www/html/intercambio

# Criar link simbólico para mídias
sudo ln -s /mnt/fotosIntercambio /var/www/html/media/intercambio

# Definir permissões
sudo chown -R www-data:www-data /var/www/html/media
sudo chmod -R 755 /var/www/html/media
```

### 2. Verificar Permissões
```bash
# Verificar se o link foi criado
ls -la /var/www/html/media/

# Verificar permissões
ls -la /mnt/fotosIntercambio/
```

### 3. Testar Acesso
```bash
# Testar se as mídias estão acessíveis
curl -I http://localhost/media/intercambio/Boston/Harvard/

# Verificar se o Apache/Nginx está rodando
sudo systemctl status apache2
# ou
sudo systemctl status nginx
```

## 🌐 URLs Finais

Após a configuração, suas URLs serão:

- **Site**: https://www.portalmantec.com.br/intercambio/
- **Boston**: https://www.portalmantec.com.br/intercambio/boston.html
- **New York**: https://www.portalmantec.com.br/intercambio/newyork.html
- **Mídias**: https://www.portalmantec.com.br/media/intercambio/

## 🔍 Troubleshooting

### Problema: 403 Forbidden
```bash
# Verificar permissões
sudo chmod -R 755 /mnt/fotosIntercambio
sudo chown -R www-data:www-data /mnt/fotosIntercambio
```

### Problema: 404 Not Found
```bash
# Verificar se o link simbólico existe
ls -la /var/www/html/media/intercambio

# Recriar link se necessário
sudo rm /var/www/html/media/intercambio
sudo ln -s /mnt/fotosIntercambio /var/www/html/media/intercambio
```

### Problema: CORS
```bash
# Verificar se os módulos estão ativos
sudo a2enmod headers
sudo systemctl restart apache2
```

## 📊 Verificação Final

Execute estes comandos para verificar se tudo está funcionando:

```bash
# 1. Verificar estrutura
ls -la /var/www/html/media/intercambio/

# 2. Verificar permissões
ls -la /mnt/fotosIntercambio/

# 3. Testar acesso local
curl -I http://localhost/media/intercambio/Boston/Harvard/

# 4. Verificar logs
sudo tail -f /var/log/apache2/error.log
# ou
sudo tail -f /var/log/nginx/error.log
```

## 🎯 Próximos Passos

1. **Execute os comandos acima** para configurar o acesso web
2. **Faça upload dos arquivos do site** para `/var/www/html/intercambio/`
3. **Teste as URLs** para verificar se tudo está funcionando
4. **Configure SSL** se necessário para HTTPS



