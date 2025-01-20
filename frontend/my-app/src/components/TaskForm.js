import React, { useState } from 'react';
import './TaskForm.css'

const TaskForm = ({ onAdd, initialTask = null, onEditSubmit }) => {
    const [title, setTitle] = useState(initialTask ? initialTask.title : '');
    const [description, setDescription] = useState(initialTask ? initialTask.description : '');
    const isEditing = !!initialTask;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim() === '') return;

        if(isEditing)
        {
          onEditSubmit({title, description, id: initialTask.id});
        } else {
           onAdd({ title, description });
           setTitle('');
           setDescription('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="task-form">
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                />
            <button type="submit">{isEditing ? "Save" : "Add Task"}</button>
        </form>
    );
};

export default TaskForm;