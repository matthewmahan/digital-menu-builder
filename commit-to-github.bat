@echo off
echo ========================================
echo Digital Menu Builder - GitHub Commit
echo ========================================
echo.

echo Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo Git is installed! Proceeding with commit...
echo.

echo Initializing Git repository...
git init

echo Adding all files to staging...
git add .

echo Creating initial commit...
git commit -m "🎉 Initial commit: Digital Menu Builder App

✨ Features:
- Complete React frontend with authentication system
- Express backend with SQLite database
- User onboarding flow with 5-step setup
- Dashboard with menu management
- QR code generation for menu sharing
- Responsive design with Tailwind CSS
- File upload capabilities
- Subscription tier system

🏗️ Tech Stack:
- Frontend: React 18, React Router, Tailwind CSS
- Backend: Node.js, Express, SQLite
- Authentication: JWT tokens
- Forms: React Hook Form + Zod validation

📱 Mobile-first responsive design
🔐 Secure authentication and authorization
🎨 Modern UI/UX with beautiful animations"

echo.
echo ========================================
echo COMMIT COMPLETED!
echo ========================================
echo.
echo Next steps:
echo 1. Create a repository on GitHub.com
echo 2. Run these commands:
echo    git remote add origin https://github.com/YOUR_USERNAME/digital-menu-builder.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo Replace YOUR_USERNAME with your actual GitHub username!
echo.
pause 