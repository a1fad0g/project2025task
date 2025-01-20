@echo off
echo Stopping containers...
docker-compose down

echo Removing volumes...
for /f "tokens=*" %%i in ('docker volume ls -q ^| findstr "_postgres_data"') do docker volume rm %%i

echo Starting containers...
docker-compose up --build -d

echo Waiting for database to start...
timeout /t 10

echo Creating database tables...
docker-compose exec backend bash -c "python -c 'from app import db; db.create_all()'"

echo Done! Application is ready.