Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Digital Menu Builder - GitHub Commit" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/" -ForegroundColor Yellow
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Initializing Git repository..." -ForegroundColor Yellow
git init

Write-Host "Adding all files to staging..." -ForegroundColor Yellow
git add .

Write-Host "Creating initial commit..." -ForegroundColor Yellow
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

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "COMMIT COMPLETED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a repository on GitHub.com" -ForegroundColor White
Write-Host "2. Run these commands:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/digital-menu-builder.git" -ForegroundColor Yellow
Write-Host "   git branch -M main" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "Replace YOUR_USERNAME with your actual GitHub username!" -ForegroundColor Red
Write-Host ""
Read-Host "Press Enter to exit" 