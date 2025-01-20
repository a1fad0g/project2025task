FROM python:3.9

# Установка bash
RUN apt-get update && apt-get install -y bash

# Установка рабочей директории
WORKDIR /app

# Копирование файлов проекта
COPY requirements.txt .
COPY app.py .

# Установка зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Установка bash как оболочки по умолчанию
SHELL ["/bin/bash", "-c"]

# Команда для запуска приложения
CMD ["python", "app.py"] 