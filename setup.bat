@echo off
REM ===========================================
REM MARITIME VESSEL TRACKING - AUTO SETUP SCRIPT (Windows)
REM ===========================================

echo.
echo ========================================== Maritime Vessel Tracking - Automated Setup
echo ==============================================
echo.

REM Check if .env exists
if not exist .env (
    echo [WARNING] .env file not found!
    echo Creating .env from .env.example...
    
    if exist .env.example (
        copy .env.example .env
        echo [SUCCESS] .env file created!
        echo [WARNING] Please edit .env and add your API keys before continuing
        echo.
        pause
    ) else (
        echo [WARNING] .env.example not found. Creating blank .env and continuing...
        type nul > .env
        echo [SUCCESS] Created blank .env
    )
)

echo.
echo Step 1: Installing Python dependencies...
pushd core
pip install -r requirements.txt

echo.
echo Step 2: Running database migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Step 3: Creating superuser...
echo Please enter superuser credentials:
python manage.py createsuperuser

echo.
echo Step 4: Importing initial data...

if exist "data" (
    echo   Importing ports...
    python manage.py import_ports 2>nul || echo   Port import skipped
    
    echo   Importing vessels...
    python manage.py sync_vessels --mode import --file data\vessels.csv --enrich --enrich-limit 10000 2>nul || echo   Vessel import skipped

    echo   Importing routes...
    python manage.py import_routes 2>nul || echo   Route import skipped
) else (
    echo [WARNING] No data directory found, skipping data import
)

echo.
echo Step 5: Collecting static files...
python manage.py collectstatic --noinput
popd

echo.
echo [SUCCESS] Backend setup complete!
echo.
echo ==============================================
echo Setting up Frontend...
echo ==============================================

if exist "frontend" (
    cd frontend
    
    echo.
    echo Installing Node dependencies...
    call npm install
    
    echo.
    echo [SUCCESS] Frontend setup complete!
    
    cd ..
) else (
    echo [WARNING] Frontend directory not found
)

echo.
echo ==============================================
echo [SUCCESS] Setup Complete!
echo ==============================================
echo.
echo To start the application:
echo.
echo Backend:
echo   cd core
echo   python manage.py runserver
echo.
echo Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Admin Panel: http://localhost:8001/admin
echo Frontend: http://localhost:5173
echo.
echo Happy tracking!
echo.
pause
