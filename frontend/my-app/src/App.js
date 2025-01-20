import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [error, setError] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [priority, setPriority] = useState('low');

  // Загрузка задач при монтировании компонента
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  // Получение списка задач
  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Добавление новой задачи
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !selectedUser) {
      setError('Please enter task title and select user');
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/tasks', {
        title: newTask,
        description: 'Task description',
        author_id: parseInt(selectedUser),
        priority: priority
      });
      setNewTask('');
      setError('');
      fetchTasks();
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding task');
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim()) {
      setError('Please enter username and email');
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/users', {
        username: newUsername,
        email: newEmail
      });
      setNewUsername('');
      setNewEmail('');
      setError('');
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding user');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
        return '#ff4444';  // красный
      case 'medium':
        return '#ffbb33';  // желтый
      case 'low':
        return '#00C851';  // зеленый
      default:
        return '#00C851';  // по умолчанию зеленый
    }
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      
      {error && <div className="error">{error}</div>}
      
      {/* Форма создания пользователя */}
      <div className="user-form">
        <h2>Add New User</h2>
        <form onSubmit={addUser}>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter username"
          />
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter email"
          />
          <button type="submit">Add User</button>
        </form>
      </div>

      {/* Существующая форма создания задачи */}
      <div className="task-form">
        <h2>Add New Task</h2>
        <form onSubmit={addTask}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter new task"
          />
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button type="submit">Add Task</button>
        </form>
      </div>

      <div className="task-list">
        <h2>Tasks</h2>
        <ul>
          {tasks.map((task) => (
            <li 
              key={task.id}
              style={{
                borderLeft: `5px solid ${getPriorityColor(task.priority)}`,
                padding: '10px',
                margin: '10px 0',
                backgroundColor: '#f8f9fa'
              }}
            >
              <div className="task-title">{task.title}</div>
              <div className="task-info">
                by {task.author} at {new Date(task.created_at).toLocaleString()}
              </div>
              <div className="task-priority">
                Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
