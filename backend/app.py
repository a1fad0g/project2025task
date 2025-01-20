import os
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import DevelopmentConfig
from prometheus_flask_exporter import PrometheusMetrics
from enum import Enum

app = Flask(__name__)

# Определяем URL базы данных в зависимости от окружения
if os.environ.get('DOCKER_ENV'):
    db_url = 'postgresql://postgres:1@db:5432/todo_db'
else:
    db_url = 'postgresql://postgres:1@localhost:5432/todo_db'

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

metrics = PrometheusMetrics(app)

# Добавим базовые метрики
metrics.info('app_info', 'Application info', version='1.0.0')

# Счетчики для задач и пользователей
tasks_counter = metrics.counter(
    'tasks_created_total', 'Number of tasks created'
)
users_counter = metrics.counter(
    'users_created_total', 'Number of users created'
)

class Priority(str, Enum):
    HIGH = 'high'
    MEDIUM = 'medium'
    LOW = 'low'

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    tasks = db.relationship('Task', backref='author', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    priority = db.Column(db.String(10), nullable=False, default=Priority.LOW.value)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'is_completed': self.is_completed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'author': self.author.username if self.author else None,
            'priority': self.priority
        }

@app.route('/')
def index():
    return "Todo API is running!"

@app.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        print("Received data:", data)  # Отладочный вывод
        
        if not data or 'username' not in data or 'email' not in data:
            return jsonify({'error': 'Missing username or email'}), 400
            
        new_user = User(
            username=data['username'],
            email=data['email']
        )
        db.session.add(new_user)
        db.session.commit()
        print("User created successfully:", new_user.to_dict())  # Отладочный вывод
        return jsonify(new_user.to_dict()), 201
        
    except Exception as e:
        print("Error creating user:", str(e))  # Отладочный вывод
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users])
    except Exception as e:
        print("Error getting users:", str(e))
        return jsonify({'error': str(e)}), 400

@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    try:
        new_task = Task(
            title=data['title'],
            description=data.get('description', ''),
            author_id=data['author_id'],
            priority=data.get('priority', Priority.LOW.value)  # Добавляем приоритет
        )
        db.session.add(new_task)
        db.session.commit()
        tasks_counter.inc()
        return jsonify(new_task.to_dict()), 201
    except Exception as e:
        print("Error:", str(e))
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.all()
        return jsonify([task.to_dict() for task in tasks])
    except Exception as e:
        print("Error getting tasks:", str(e))  # для отладки
        return jsonify({'error': str(e)}), 400

@app.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get(task_id)
    if not task:
      return jsonify({"message":"Task not found"}), 404
    return jsonify({"id": task.id, "title": task.title, "description": task.description, "is_completed": task.is_completed})

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get(task_id)
    if not task:
      return jsonify({"message":"Task not found"}), 404
    data = request.get_json()
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.is_completed = data.get('is_completed', task.is_completed)
    db.session.commit()
    return jsonify({'message': 'Task updated successfully'})

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
      return jsonify({"message":"Task not found"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Создаем таблицы, если они не существуют
        print("Database tables created successfully!")
    app.run(debug=True, host='0.0.0.0', port=5000)