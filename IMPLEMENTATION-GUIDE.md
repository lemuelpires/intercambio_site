# 🚀 Guia de Implementação - Site de Intercâmbio

## ✅ **Status Atual**
- ✅ **5.602 mídias processadas** com URLs do seu servidor
- ✅ **Arquivos do site prontos** na pasta `public/`
- ✅ **URLs configuradas** para `www.portalmantec.com.br`

## 📋 **Passo a Passo da Implementação**

### **PARTE 1: Configurar Servidor (www.portalmantec.com.br)**

#### **1.1. Criar Estrutura no Servidor**
```bash
# No seu servidor, execute:
sudo mkdir -p /var/www/html/media
sudo ln -s /mnt/fotosIntercambio /var/www/html/media/intercambio
sudo chown -R www-data:www-data /var/www/html/media
sudo chmod -R 755 /mnt/fotosIntercambio
```

#### **1.2. Configurar Apache**
Crie o arquivo `/etc/apache2/sites-available/intercambio-media.conf`:

```apache
<VirtualHost *:80>
    ServerName www.portalmantec.com.br
    
    # Configuração para mídias
    Alias /media/intercambio /mnt/fotosIntercambio
    
    <Directory /mnt/fotosIntercambio>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
        
        # CORS Headers para Firebase
        Header always set Access-Control-Allow-Origin "*"
        Header always set Access-Control-Allow-Methods "GET, HEAD, OPTIONS"
        Header always set Access-Control-Allow-Headers "Range, Content-Type"
        
        # Cache otimizado
        ExpiresActive On
        ExpiresByType image/jpeg "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/gif "access plus 1 year"
        ExpiresByType video/mp4 "access plus 1 year"
        ExpiresByType video/quicktime "access plus 1 year"
        ExpiresByType video/x-msvideo "access plus 1 year"
    </Directory>
</VirtualHost>
```

#### **1.3. Ativar Configuração**
```bash
# Ativar site e módulos
sudo a2ensite intercambio-media.conf
sudo a2enmod headers
sudo a2enmod expires

# Reiniciar Apache
sudo systemctl restart apache2
```

#### **1.4. Testar Servidor**
```bash
# Testar se as mídias estão acessíveis
curl -I http://localhost/media/intercambio/Boston/Harvard/

# Deve retornar:
# HTTP/1.1 200 OK
# Access-Control-Allow-Origin: *
```

### **PARTE 2: Configurar Firebase**

#### **2.1. Inicializar Firebase**
```bash
# No Windows, execute:
firebase init hosting

# Escolha:
# - Use existing project (se já tem)
# - Public directory: public
# - Single-page app: No
# - GitHub auto-builds: No
```

#### **2.2. Configurar firebase.json**
O arquivo já está criado com a configuração correta.

#### **2.3. Fazer Deploy**
```bash
# Deploy para Firebase
firebase deploy

# Ou apenas hosting
firebase deploy --only hosting
```

### **PARTE 3: Testar Implementação**

#### **3.1. URLs Finais**
- **Site**: `https://seu-projeto.web.app`
- **Boston**: `https://seu-projeto.web.app/boston.html`
- **New York**: `https://seu-projeto.web.app/newyork.html`

#### **3.2. Testar Mídias**
- Acesse o site no Firebase
- Navegue pelas galerias
- Verifique se as imagens carregam do seu servidor

## 🔧 **Configurações Detalhadas**

### **Apache - Configuração Completa**

```apache
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
```

### **Nginx - Configuração Alternativa**

```nginx
server {
    listen 80;
    server_name www.portalmantec.com.br;
    root /var/www/html;
    
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
```

## 🧪 **Scripts de Teste**

### **Teste de Conectividade**
```bash
#!/bin/bash
# test-server.sh

echo "🧪 Testando servidor de mídias..."

# Teste 1: Servidor responde
echo "1. Testando resposta do servidor..."
curl -I http://localhost/media/intercambio/Boston/Harvard/ | head -5

# Teste 2: CORS Headers
echo "2. Testando CORS..."
curl -H "Origin: https://test.web.app" -I http://localhost/media/intercambio/Boston/Harvard/ | grep -i cors

# Teste 3: Lista de arquivos
echo "3. Testando listagem..."
curl -s http://localhost/media/intercambio/Boston/Harvard/ | head -10

echo "✅ Testes concluídos!"
```

### **Teste de Performance**
```bash
#!/bin/bash
# test-performance.sh

echo "⚡ Testando performance..."

# Teste de velocidade
time curl -s -o /dev/null http://localhost/media/intercambio/Boston/Harvard/

# Teste de cache
echo "Testando cache..."
curl -I http://localhost/media/intercambio/Boston/Harvard/ | grep -i cache

echo "✅ Teste de performance concluído!"
```

## 📊 **Monitoramento**

### **Logs do Apache**
```bash
# Ver logs em tempo real
sudo tail -f /var/log/apache2/intercambio_access.log

# Ver logs de erro
sudo tail -f /var/log/apache2/intercambio_error.log
```

### **Logs do Firebase**
```bash
# Ver logs do Firebase
firebase functions:log

# Ver status do deploy
firebase hosting:channel:list
```

## 🚨 **Troubleshooting**

### **Problema: CORS Error**
```bash
# Verificar se módulo headers está ativo
sudo a2enmod headers
sudo systemctl restart apache2
```

### **Problema: 403 Forbidden**
```bash
# Verificar permissões
sudo chmod -R 755 /mnt/fotosIntercambio
sudo chown -R www-data:www-data /mnt/fotosIntercambio
```

### **Problema: 404 Not Found**
```bash
# Verificar link simbólico
ls -la /var/www/html/media/intercambio

# Recriar se necessário
sudo rm /var/www/html/media/intercambio
sudo ln -s /mnt/fotosIntercambio /var/www/html/media/intercambio
```

## 🎯 **Checklist Final**

- [ ] Servidor configurado com CORS
- [ ] Link simbólico criado
- [ ] Permissões configuradas
- [ ] Apache/Nginx reiniciado
- [ ] Firebase inicializado
- [ ] Deploy feito
- [ ] Site testado
- [ ] Mídias carregando corretamente

## 🌐 **URLs Finais**

Após a implementação:

- **Site**: `https://seu-projeto.web.app`
- **Mídias**: `https://www.portalmantec.com.br/media/intercambio/`
- **Exemplo**: `https://www.portalmantec.com.br/media/intercambio/Boston/Harvard/IMG_001.jpg`

---

**🎉 Pronto! Seu site estará hospedado no Firebase e as mídias no seu servidor!**



