@echo off
echo ========================================
echo    INSTALADOR - SERVIDOR PESSOAL
echo    Intercambio Media Server
echo ========================================
echo.

echo [1/3] Copiando arquivos de configuração...
copy home-server-package.json package.json
echo ✓ Arquivos copiados

echo.
echo [2/3] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo [3/3] Configurando servidor...
echo ✓ Servidor configurado

echo.
echo ========================================
echo    INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo Para iniciar o servidor:
echo   npm start
echo.
echo O servidor estara disponivel em:
echo   http://seu-ip:8080
echo.
pause