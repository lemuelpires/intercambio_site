# Configuração do Servidor Pessoal

## 🏠 Configuração do Servidor em Casa

### 1. Preparar o Servidor
1. Copie todos os arquivos para uma pasta no seu servidor
2. Execute: `install-server.bat`
3. Configure o IP do servidor em `server-config.json`

### 2. Configurar Rede
1. **IP Estático**: Configure um IP fixo para o servidor
2. **Porta**: Abra a porta 8080 no firewall
3. **Roteador**: Configure port forwarding se necessário

### 3. Estrutura de Pastas
```
/media/intercambio/
├── Boston/
│   ├── Acomodações/
│   ├── Cientistas Cristãos/
│   └── ...
├── NewYork/
│   ├── Central Park/
│   ├── Downtown/
│   └── ...
└── thumbnails/
```

### 4. Copiar Mídias
1. Copie suas mídias para a pasta `/media/intercambio/`
2. Organize nas subpastas conforme sua estrutura atual
3. Execute o processador para gerar metadados

### 5. Iniciar Servidor
```bash
npm start
```

### 6. Testar Acesso
- Local: http://localhost:8080/health
- Rede: http://seu-ip:8080/health
- Mídias: http://seu-ip:8080/media/

## 🌐 Configuração do Firebase

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login no Firebase
```bash
firebase login
```

### 3. Inicializar Projeto
```bash
firebase init hosting
```

### 4. Configurar Deploy
1. Atualize `server-config.json` com seu IP
2. Execute: `npm run process-remote`
3. Execute: `npm run deploy`

## 🔧 Troubleshooting

### Servidor não acessível
- Verifique firewall
- Confirme IP estático
- Teste com `telnet seu-ip 8080`

### Mídias não carregam
- Verifique permissões das pastas
- Confirme estrutura de pastas
- Teste URL diretamente no navegador

### Firebase deploy falha
- Verifique login: `firebase login --reauth`
- Confirme projeto: `firebase use --add`
- Verifique arquivos em `public/`
