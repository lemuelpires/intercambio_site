@echo off
echo ========================================
echo    INSTALADOR - SISTEMA DE MIDIAS
echo    Intercambio Site
echo ========================================
echo.

echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js de https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

echo.
echo [2/5] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo [3/5] Copiando midias...
call npm run copy-media
if %errorlevel% neq 0 (
    echo AVISO: Falha ao copiar algumas midias, continuando...
)

echo.
echo [4/5] Processando metadados...
call npm run process-media
if %errorlevel% neq 0 (
    echo ERRO: Falha ao processar metadados
    pause
    exit /b 1
)
echo ✓ Metadados processados

echo.
echo [5/5] Gerando thumbnails...
call npm run generate-thumbnails
if %errorlevel% neq 0 (
    echo AVISO: Falha ao gerar alguns thumbnails, continuando...
)

echo.
echo ========================================
echo    INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo Para visualizar o site, execute:
echo   npm run dev
echo.
echo Ou abra o arquivo index.html no navegador
echo.
pause



