# Instruções para Upload no Servidor

## 📁 Estrutura de Pastas no Servidor

Crie a seguinte estrutura no seu servidor www.portalmantec.com.br:

```
/
├── media/
│   └── intercambio/
│       ├── Boston/
│       │   ├── Acomodações/
│       │   ├── Cientistas Cristãos/
│       │   ├── Começo/
│       │   ├── Desembarque em Boston/
│       │   ├── diversas/
│       │   ├── EC College/
│       │   ├── Freedom Trail/
│       │   ├── Harvard/
│       │   ├── Igreja no Quincy/
│       │   ├── M.I.T/
│       │   ├── Memorial de Guerra/
│       │   ├── Parque/
│       │   ├── Partida/
│       │   ├── Pier/
│       │   ├── Pizza em estabelecimento na John Adams/
│       │   ├── Primeiro Tratejo à escola/
│       │   ├── Proximidades da escola/
│       │   ├── Quincy Center/
│       │   ├── Ruas de Boston/
│       │   ├── Suprema Corte Michigan/
│       │   └── Videos/
│       ├── NewYork/
│       │   ├── Central Park/
│       │   ├── Downtown/
│       │   ├── Empire State Building/
│       │   ├── Estatua da Liberdade/
│       │   ├── Memorial world Trade Center/
│       │   ├── Pier/
│       │   ├── Ponte/
│       │   ├── times square/
│       │   └── Viagem/
│       └── thumbnails/
└── intercambio/ (arquivos do site)
    ├── index.html
    ├── boston.html
    ├── newyork.html
    ├── styles.css
    ├── remote-gallery.js
    ├── config.json
    └── data/
        ├── boston.json
        └── newyork.json
```

## 🚀 Passos para Upload

### 1. Upload das Mídias
Copie TODAS as suas mídias de:
`C:\Users\lemuel\Desktop\wordpress\projetos Intercâmbio\fotos Intercambio\`

Para:
`/media/intercambio/` no seu servidor

### 2. Upload do Site
Copie os arquivos da pasta `public/` para:
`/intercambio/` no seu servidor

### 3. Configurar Permissões
```bash
# No servidor, execute:
chmod -R 755 /media/intercambio/
chmod -R 755 /intercambio/
```

### 4. Testar Acesso
- Site: https://www.portalmantec.com.br/intercambio/
- Mídias: https://www.portalmantec.com.br/media/intercambio/

## 📊 Tamanho dos Arquivos

- **Mídias**: ~30GB (todas as fotos e vídeos)
- **Site**: ~2MB (HTML, CSS, JS, JSON)

## ⚠️ Importante

1. **Backup**: Faça backup antes de fazer upload
2. **Permissões**: Configure corretamente as permissões de leitura
3. **CORS**: Configure CORS no servidor se necessário
4. **SSL**: Use HTTPS para melhor segurança

## 🔧 Configuração do Servidor Web

Se usar Apache, adicione no .htaccess:

```apache
# Permitir CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, HEAD, OPTIONS"
Header always set Access-Control-Allow-Headers "Range, Content-Type"

# Cache para mídias
<FilesMatch "\.(jpg|jpeg|png|gif|mp4|mov)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

Se usar Nginx, adicione:

```nginx
location /media/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS";
    add_header Access-Control-Allow-Headers "Range, Content-Type";
    expires 1y;
}
```
