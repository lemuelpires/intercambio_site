# 🎯 Configuração Final - Site de Intercâmbio

## ✅ Status Atual
- ✅ **5.602 mídias processadas** (2.930 Boston + 2.672 New York)
- ✅ **Mídias copiadas** para `/mnt/fotosIntercambio/` no servidor
- ✅ **URLs configuradas** para `www.portalmantec.com.br`
- ✅ **Arquivos do site** prontos na pasta `public/`

## 🚀 Próximos Passos

### **1. Configurar Acesso Web no Servidor**

Execute no servidor `www.portalmantec.com.br`:

```bash
# 1. Criar estrutura de diretórios
sudo mkdir -p /var/www/html/media
sudo mkdir -p /var/www/html/intercambio

# 2. Criar link simbólico para mídias
sudo ln -s /mnt/fotosIntercambio /var/www/html/media/intercambio

# 3. Definir permissões
sudo chown -R www-data:www-data /var/www/html/media
sudo chmod -R 755 /var/www/html/media
sudo chmod -R 755 /mnt/fotosIntercambio
```

### **2. Configurar Apache (se usar Apache)**

```bash
# Criar arquivo de configuração
sudo nano /etc/apache2/sites-available/intercambio.conf
```

Cole este conteúdo:
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
        ExpiresByType video/mp4 "access plus 1 year"
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

Ativar configuração:
```bash
sudo a2ensite intercambio.conf
sudo a2enmod headers
sudo a2enmod expires
sudo systemctl restart apache2
```

### **3. Configurar Nginx (se usar Nginx)**

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/intercambio
```

Cole este conteúdo:
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

Ativar configuração:
```bash
sudo ln -s /etc/nginx/sites-available/intercambio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **4. Fazer Upload dos Arquivos do Site**

Execute localmente (no Windows):

```bash
# Usando rsync (se disponível)
rsync -avz --progress public/ lemuel@www.portalmantec.com.br:/var/www/html/intercambio/

# Ou usando SCP
scp -r public/* lemuel@www.portalmantec.com.br:/var/www/html/intercambio/

# Ou usando SFTP
sftp lemuel@www.portalmantec.com.br
put -r public/* /var/www/html/intercambio/
```

### **5. Verificar se Está Funcionando**

```bash
# No servidor, testar acesso local
curl -I http://localhost/media/intercambio/Boston/Harvard/

# Verificar se os arquivos estão no lugar
ls -la /var/www/html/intercambio/
ls -la /var/www/html/media/intercambio/
```

## 🌐 URLs Finais

Após a configuração, suas URLs serão:

- **Site Principal**: https://www.portalmantec.com.br/intercambio/
- **Boston**: https://www.portalmantec.com.br/intercambio/boston.html
- **New York**: https://www.portalmantec.com.br/intercambio/newyork.html
- **Teste**: https://www.portalmantec.com.br/intercambio/test-upload.html

## 📊 Estrutura Final no Servidor

```
/var/www/html/
├── media/
│   └── intercambio/ -> /mnt/fotosIntercambio/ (link simbólico)
│       ├── Boston/ (2.930 mídias)
│       ├── NewYork/ (2.672 mídias)
│       └── Retorno/
└── intercambio/ (arquivos do site)
    ├── index.html
    ├── boston.html
    ├── newyork.html
    ├── styles.css
    ├── remote-gallery.js
    ├── config.json
    ├── data/
    │   ├── boston.json
    │   └── newyork.json
    └── test-upload.html
```

## 🔧 Troubleshooting

### Problema: 403 Forbidden
```bash
sudo chmod -R 755 /mnt/fotosIntercambio
sudo chown -R www-data:www-data /mnt/fotosIntercambio
```

### Problema: 404 Not Found
```bash
# Verificar se o link simbólico existe
ls -la /var/www/html/media/intercambio

# Recriar se necessário
sudo rm /var/www/html/media/intercambio
sudo ln -s /mnt/fotosIntercambio /var/www/html/media/intercambio
```

### Problema: CORS
```bash
# Verificar se os módulos estão ativos (Apache)
sudo a2enmod headers
sudo systemctl restart apache2
```

## 🎉 Resultado Final

Após seguir todos os passos, você terá:

- ✅ **Site hospedado** em `www.portalmantec.com.br`
- ✅ **5.602 mídias acessíveis** via web
- ✅ **Filtros funcionais** por dispositivo e tipo
- ✅ **Interface responsiva** e moderna
- ✅ **Performance otimizada** com cache
- ✅ **CORS configurado** para acesso remoto

**Total de mídias**: 5.602 (2.930 Boston + 2.672 New York)  
**Tamanho**: ~30GB  
**Dispositivos**: Samsung A50, iPhone 16  
**Tipos**: Fotos e vídeos



