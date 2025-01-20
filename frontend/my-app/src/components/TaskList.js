import React from 'react';
import './TaskList.css';

const TaskList = ({ tasks, onDelete, onToggle, onEdit }) => {
    return (
        <ul className="task-list">
            {tasks.map(task => (
                <li key={task.id} className={`task-item ${task.is_completed ? 'completed' : ''}`}>
                   <div className="task-content">
                        <span
                          onClick={() => onToggle(task.id)}
                          className={`task-title ${task.is_completed ? 'completed-title' : ''}`}
                          >
                           {task.title}
                       </span>
                       <p className="task-description">{task.description}</p>
                   </div>
                   <div className="task-actions">
                       <button onClick={() => onEdit(task.id)} className="edit-button">Edit</button>
                       <button onClick={() => onDelete(task.id)} className="delete-button">Delete</button>
                   </div>
                </li>
            ))}
        </ul>
    );
};

export default TaskList;