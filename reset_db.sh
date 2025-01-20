#!/bin/bash

echo "Stopping containers..."
docker-compose down

echo "Removing volumes..."
docker volume rm $(docker volume ls -q | grep "_postgres_data")

echo "Starting containers..."
docker-compose up --build -d

echo "Waiting for database to start..."
sleep 10

echo "Creating tables..."
docker-compose exec backend python -c "
from app import db
db.create_all()
"

echo "Done! Application is ready." 