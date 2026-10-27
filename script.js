// Retrieve tasks from localStorage or initialize empty array
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];
let currentFilter = 'all';

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

// Save tasks to localStorage and re-render
function saveAndRender() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    renderTasks();
}

// Render tasks based on current filter
function renderTasks() {
    taskList.innerHTML = '';

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true; // 'all'
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<li class="empty-state">No tasks found. Enjoy your day! 🎉</li>`;
    } else {
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="task-left">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${task.id})">
                    <span class="task-text">${escapeHTML(task.text)}</span>
                </div>
                <button class="btn-delete" onclick="deleteTask(${task.id})" title="Delete task">🗑️</button>
            `;
            taskList.appendChild(li);
        });
    }

    // Update remaining count
    const activeCount = tasks.filter(t => !t.completed).length;
    taskCount.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} remaining`;
}

// Add new task
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    taskInput.value = '';
    saveAndRender();
});

// Toggle task completion
window.toggleTask = function(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
};

// Delete single task
window.deleteTask = function(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
};

// Clear completed tasks
clearCompletedBtn.addEventListener('click', function() {
    tasks = tasks.filter(task => !task.completed);
    saveAndRender();
});

// Filter button event listeners
filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter');
        renderTasks();
    });
});

// Security helper to prevent XSS injection in task text
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Initial render on page load
renderTasks();