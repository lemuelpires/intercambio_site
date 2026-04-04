# Sistema de Gerenciamento de Mídias - Intercâmbio

Este sistema foi criado para organizar e exibir suas 3000+ fotos e vídeos do intercâmbio, capturados com Samsung A50 e iPhone 16.

## 📁 Estrutura de Pastas

Sua organização atual em `C:\Users\lemuel\Desktop\wordpress\projetos Intercâmbio\fotos Intercambio`:

```
fotos Intercambio/
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
│   ├── M.I.T/
│   ├── Memorial de Guerra/
│   ├── Parque/
│   └── Partida/
├── NewYork/
│   ├── Central Park/
│   ├── Downtown/
│   ├── Empire State Building/
│   ├── Estatua da Liberdade/
│   ├── Memorial world Trade Center/
│   ├── Pier/
│   ├── Ponte/
│   ├── times square/
│   ├── Videos/
│   ├── Viagem/
│   └── Retorno/
└── Videos/
```

## 🚀 Como Usar

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração

Edite o arquivo `config.json` se necessário para ajustar:
- Caminho das suas mídias
- Configurações de thumbnails
- Categorias e dispositivos

### 3. Processamento das Mídias

Execute os comandos na ordem:

```bash
# 1. Copia as mídias para o projeto
npm run copy-media

# 2. Processa e gera metadados
npm run process-media

# 3. Gera thumbnails (opcional, mas recomendado)
npm run generate-thumbnails

# Ou execute tudo de uma vez:
npm run setup
```

### 4. Visualizar o Site

```bash
npm run dev
```

## 📊 Funcionalidades

### Filtros Disponíveis
- **Todas**: Mostra todas as mídias
- **Samsung A50**: Apenas fotos/vídeos do Samsung A50
- **iPhone 16**: Apenas fotos/vídeos do iPhone 16
- **Fotos**: Apenas imagens
- **Vídeos**: Apenas vídeos

### Informações Exibidas
- Dispositivo usado para captura
- Categoria da foto/vídeo
- Data de captura
- Título gerado automaticamente

### Paginação
- 20 itens por página
- Navegação entre páginas
- Contador de páginas

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run copy-media` | Copia mídias da pasta original para o projeto |
| `npm run process-media` | Analisa mídias e gera metadados JSON |
| `npm run generate-thumbnails` | Gera thumbnails otimizados |
| `npm run setup` | Executa todos os scripts em sequência |
| `npm run dev` | Inicia servidor local para visualização |
| `npm run build` | Processa mídias e gera thumbnails |

## 📱 Detecção de Dispositivos

O sistema detecta automaticamente o dispositivo baseado no nome do arquivo:

- **Samsung A50**: Arquivos com padrões como `SAMSUNG`, `A50`, ou formato `YYYYMMDD_HHMMSS`
- **iPhone 16**: Arquivos com padrões como `IMG_`, `VID_`, `iPhone`, ou `16`
- **Desconhecido**: Arquivos que não se encaixam nos padrões acima

## 🎨 Personalização

### Categorias
Edite o arquivo `config.json` para personalizar:
- Ícones das categorias
- Nomes de exibição
- Cores dos dispositivos

### Estilos
Modifique `styles.css` para ajustar:
- Cores do tema
- Layout da galeria
- Tamanhos dos elementos

## 📈 Estatísticas

O sistema gera estatísticas automáticas:
- Total de mídias processadas
- Contagem por dispositivo
- Contagem por tipo (foto/vídeo)
- Contagem por cidade

## ⚠️ Notas Importantes

1. **Tamanho**: Com 30,1GB de mídias, o processamento pode demorar
2. **Thumbnails**: Recomendado instalar `sharp` para geração otimizada
3. **Backup**: Sempre mantenha backup das suas mídias originais
4. **Performance**: O carregamento inicial pode ser lento com muitas mídias

## 🐛 Solução de Problemas

### Erro de permissão
```bash
# Execute como administrador no Windows
```

### Erro de memória
```bash
# Aumente o limite de memória do Node.js
node --max-old-space-size=4096 media-processor.js
```

### Thumbnails não gerados
```bash
# Instale sharp manualmente
npm install sharp
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todos os caminhos estão corretos
2. Confirme se as dependências estão instaladas
3. Verifique os logs de erro no console



