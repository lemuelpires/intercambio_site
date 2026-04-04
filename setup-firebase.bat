@echo off
echo ========================================
echo    CONFIGURACAO FIREBASE
echo    Site de Intercambio
echo ========================================
echo.

echo [1/4] Verificando Firebase CLI...
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Firebase CLI nao encontrado!
    echo Instale com: npm install -g firebase-tools
    pause
    exit /b 1
)
echo ✓ Firebase CLI encontrado

echo.
echo [2/4] Verificando login...
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Nao autenticado no Firebase!
    echo Execute: firebase login
    pause
    exit /b 1
)
echo ✓ Autenticado no Firebase

echo.
echo [3/4] Verificando arquivos...
if not exist "public\index.html" (
    echo ERRO: Arquivos do site nao encontrados!
    echo Execute primeiro: npm run process-remote
    pause
    exit /b 1
)
echo ✓ Arquivos do site encontrados

echo.
echo [4/4] Inicializando Firebase...
echo.
echo IMPORTANTE: Quando solicitado:
echo - Escolha "Use an existing project" ou "Create a new project"
echo - Public directory: public
echo - Single-page app: No
echo - GitHub auto-builds: No
echo.
pause

firebase init hosting

echo.
echo ========================================
echo    CONFIGURACAO CONCLUIDA!
echo ========================================
echo.
echo Para fazer deploy:
echo   firebase deploy
echo.
echo Para deploy apenas do hosting:
echo   firebase deploy --only hosting
echo.
pause



