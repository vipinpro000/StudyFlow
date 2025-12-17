import React, { useState, useEffect } from 'react'
import './App.css'

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [tasks, setTasks] = useState([
    { id: 1, subject: 'Mathematics', task: 'Complete Chapter 5', deadline: '2024-01-20', status: 'pending' },
    { id: 2, subject: 'Physics', task: 'Finish Project', deadline: '2024-01-18', status: 'in-progress' }
  ])
  const [timeLeft, setTimeLeft] = useState(1500)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      subject: 'New Subject',
      task: 'New Task',
      deadline: new Date().toISOString().split('T')[0],
      status: 'pending'
    }
    setTasks([...tasks, newTask])
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">📚 StudyFlow</div>
        <div className="nav-menu">
          <button 
            className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-btn ${currentPage === 'planner' ? 'active' : ''}`}
            onClick={() => setCurrentPage('planner')}
          >
            Planner
          </button>
          <button 
            className={`nav-btn ${currentPage === 'tracker' ? 'active' : ''}`}
            onClick={() => setCurrentPage('tracker')}
          >
            Tracker
          </button>
          <button 
            className={`nav-btn ${currentPage === 'pomodoro' ? 'active' : ''}`}
            onClick={() => setCurrentPage('pomodoro')}
          >
            Timer
          </button>
        </div>
      </nav>

      <div className="container">
        {currentPage === 'dashboard' && (
          <div className="page dashboard">
            <h1>Welcome to StudyFlow!</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{tasks.length}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{tasks.filter(t => t.status === 'completed').length}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{tasks.filter(t => t.status === 'pending').length}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">5</div>
                <div className="stat-label">Study Hours</div>
              </div>
            </div>
            <div className="recent-section">
              <h2>Recent Tasks</h2>
              <ul className="task-list">
                {tasks.slice(0, 3).map(task => (
                  <li key={task.id} className={`task-item ${task.status}`}>
                    <span className="task-name">{task.task}</span>
                    <span className="task-subject">{task.subject}</span>
                    <span className="task-deadline">{task.deadline}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {currentPage === 'planner' && (
          <div className="page planner">
            <h1>Study Planner</h1>
            <div className="planner-content">
              <button className="add-btn" onClick={addTask}>+ Add Task</button>
              <div className="tasks-container">
                {tasks.map(task => (
                  <div key={task.id} className="task-card">
                    <h3>{task.subject}</h3>
                    <p>{task.task}</p>
                    <div className="task-meta">
                      <span className="deadline">📅 {task.deadline}</span>
                      <span className={`status ${task.status}`}>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'tracker' && (
          <div className="page tracker">
            <h1>Subject Tracker</h1>
            <div className="tracker-content">
              {['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology'].map((subject, idx) => (
                <div key={idx} className="tracker-item">
                  <div className="subject-name">{subject}</div>
                  <div className="progress-bar">
                    <div className="progress" style={{width: `${(idx + 1) * 20}%`}}></div>
                  </div>
                  <div className="progress-text">{(idx + 1) * 20}% Complete</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'pomodoro' && (
          <div className="page pomodoro">
            <h1>Pomodoro Timer</h1>
            <div className="timer-container">
              <div className="timer-display">{formatTime(timeLeft)}</div>
              <div className="timer-buttons">
                <button 
                  className="btn-primary" 
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? 'Pause' : 'Start'}
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => setTimeLeft(1500)}
                >
                  Reset
                </button>
              </div>
              <div className="timer-info">
                <p>📊 Focus Session: 25 minutes</p>
                <p>✅ Helps you study with focused intervals</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <p>StudyFlow © 2024 | Open-Source Student Productivity App</p>
      </footer>
    </div>
  )
}

export default App
