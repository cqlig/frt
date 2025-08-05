@echo off
echo 🔍 Verificando preparación para deploy...
echo.

echo 1. Verificando dependencias...
npm install

echo.
echo 2. Verificando ESLint...
npx eslint src --ext .js,.jsx --max-warnings 0

if %errorlevel% neq 0 (
    echo ❌ Se encontraron errores de ESLint
    echo Por favor, corrige los errores antes de hacer deploy
    pause
    exit /b 1
) else (
    echo ✅ No se encontraron errores de ESLint
)

echo.
echo 3. Verificando build...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Error en el build
    pause
    exit /b 1
) else (
    echo ✅ Build exitoso
)

echo.
echo 4. Verificando configuración...
if exist "netlify.toml" (
    echo ✅ netlify.toml encontrado
) else (
    echo ❌ netlify.toml no encontrado
    pause
    exit /b 1
)

if exist "src/config.js" (
    echo ✅ config.js encontrado
) else (
    echo ❌ config.js no encontrado
    pause
    exit /b 1
)

echo.
echo ✅ Todo listo para subir a Netlify!
echo.
echo 📋 Instrucciones:
echo 1. Ve a netlify.com
echo 2. Arrastra y suelta esta carpeta completa
echo 3. Netlify detectará automáticamente la configuración
echo.
pause 