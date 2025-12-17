import React, { useState, useEffect } from 'react'
import './App.css'

// Storage utility
const storageManager = {
  getTasks: () => JSON.parse(localStorage.getItem('tasks') || '[]'),
  setTasks: (tasks) => localStorage.setItem('tasks', JSON.stringify(tasks)),
  getStats: () => JSON.parse(localStorage.getItem('stats') || '{"totalHours": 0, "sessionsCompleted": 0, "longestSession": 0}'),
  setStats: (stats) => localStorage.setItem('stats', JSON.stringify(stats)),
}

// Pomodoro Timer Component
const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(1500)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState('work')

  useEffect(() => {
    if (!isRunning || timeLeft === 0) return

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [isRunning, timeLeft])

  useEffect(() => {
    if (timeLeft === 0) {
      setIsRunning(false)
      alert(`${sessionType === 'work' ? 'Work' : 'Break'} session complete!`)
      const stats = storageManager.getStats()
      stats.sessionsCompleted += 1
      stats.totalHours += sessionType === 'work' ? 0.25 : 0.05
      storageManager.setStats(stats)
      
      if (sessionType === 'work') {
        setSessionType('break')
        setTimeLeft(300)
      } else {
        setSessionType('work')
        setTimeLeft(1500)
      }
    }
  }, [timeLeft, sessionType])

  const toggleTimer = () => setIsRunning(!isRunning)
  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(sessionType === 'work' ? 1500 : 300)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="timer-container">
      <h2 className="card-title">{sessionType === 'work' ? 'Work Session' : 'Break Time'}</h2>
      <div className="timer-display">{formatTime(timeLeft)}</div>
      <div className="timer-controls">
        <button className="btn btn-primary" onClick={toggleTimer}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button className="btn btn-secondary" onClick={resetTimer}>
          Reset
        </button>
      </div>
    </div>
  )
}

// Task Manager Component
const TaskManager = () => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState(''))
  const [selectedSubject, setSelectedSubject] = useState('Mathematics')

  useEffect(() => {
    setTasks(storageManager.getTasks())
  }, [])

  useEffect(() => {
    storageManager.setTasks(tasks)
  }, [tasks])

  const addTask = () => {
    if (!newTask.trim()) return
    const task = {
      id: Date.now(),
      subject: selectedSubject,
      task: newTask,
      completed: false,
      deadline: new Date().toISOString().split('T')[0],
      status: 'in-progress'
    }
    setTasks([...tasks, task])
    setNewTask('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div className="card">
      <h2 className="card-title">📋 Task Manager</h2>
      <div className="form-group">
        <label className="form-label">Subject:</label>
        <select 
          className="form-select" 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option>Mathematics</option>
          <option>Physics</option>
          <option>Chemistry</option>
          <option>Biology</option>
          <option>English</option>
          <option>History</option>
        </select>
      </div>
      <div className="form-group" style={{flexDirection: 'row', gap: '0.5rem'}}>
        <input
          className="form-input"
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          style={{flex: 1}}
        />
        <button className="btn btn-primary btn-small" onClick={addTask}>Add</button>
      </div>
      <div>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-title">No tasks yet</p>
            <p className="empty-state-text">Add a task to get started!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-info">
                <div className="task-title">{task.task}</div>
                <div className="task-meta">{task.subject} • {task.deadline}</div>
              </div>
              <div className="task-actions">
                <button 
                  className="task-action-btn"
                  onClick={() => toggleTask(task.id)}
                  title="Toggle completion"
                >
                  {task.completed ? '✅' : '⭕'}
                </button>
                <button 
                  className="task-action-btn"
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Stats Component
const StatsPanel = () => {
  const [stats, setStats] = useState({})

  useEffect(() => {
    setStats(storageManager.getStats())
  }, [])

  return (
    <div className="card">
      <h2 className="card-title">📊 Study Statistics</h2>
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value">{stats.sessionsCompleted || 0}</div>
          <div className="stat-label">Sessions</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{(stats.totalHours || 0).toFixed(1)}h</div>
          <div className="stat-label">Total Hours</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.longestSession || 0}m</div>
          <div className="stat-label">Longest Session</div>
        </div>
      </div>
    </div>
  )
}

// Analytics Page Component
const AnalyticsPage = () => {
  const stats = storageManager.getStats()
  const tasks = storageManager.getTasks()
  const completedTasks = tasks.filter(t => t.completed).length
  const subjectBreakdown = tasks.reduce((acc, task) => {
    acc[task.subject] = (acc[task.subject] || 0) + 1
    return acc
  }, {})

  return (
    <div className="page active">
      <h1 style={{marginBottom: '2rem', color: 'white'}}>📈 Analytics Dashboard</h1>
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Overall Progress</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">{completedTasks}/{tasks.length}</div>
              <div className="stat-label">Tasks Completed</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{stats.sessionsCompleted || 0}</div>
              <div className="stat-label">Study Sessions</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{(stats.totalHours || 0).toFixed(1)}h</div>
              <div className="stat-label">Hours Studied</div>
            </div>
          </div>
        </div>
        <div className="card">
          <h2 className="card-title">Subject Breakdown</h2>
          {Object.entries(subjectBreakdown).map(([subject, count]) => (
            <div key={subject} style={{marginBottom: '1rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                <span className="task-title">{subject}</span>
                <span>{count} tasks</span>
              </div>
              <div style={{
                height: '8px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(count / tasks.length * 100) || 0}%`,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Settings Page Component
const SettingsPage = () => {
  const [theme, setTheme] = useState('dark')
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="page active">
      <h1 style={{marginBottom: '2rem', color: 'white'}}>⚙️ Settings</h1>
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Preferences</h2>
          <div className="form-group">
            <label className="form-label">Theme:</label>
            <select 
              className="form-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div className="form-group" style={{flexDirection: 'row', alignItems: 'center'}}>
            <input
              type="checkbox"
              id="notifications"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              style={{width: 'auto', marginRight: '0.5rem'}}
            />
            <label htmlFor="notifications" className="form-label">Enable Notifications</label>
          </div>
          <button className="btn btn-primary" onClick={() => alert('Settings saved!')}>Save Settings</button>
        </div>
        <div className="card">
          <h2 className="card-title">About StudyFlow</h2>
          <p style={{marginBottom: '1rem'}}>StudyFlow is a student productivity & study tracker web app built with React, Firebase, and Vite.</p>
          <p style={{marginBottom: '1rem'}}>Version: 1.0.0</p>
          <p style={{color: '#666'}}>© 2024 StudyFlow. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard')

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">📚 StudyFlow</div>
        <ul className="nav-menu">
          <li>
            <button 
              className="nav-link"
              onClick={() => setCurrentPage('dashboard')}
              style={{opacity: currentPage === 'dashboard' ? 1 : 0.7}}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button 
              className="nav-link"
              onClick={() => setCurrentPage('analytics')}
              style={{opacity: currentPage === 'analytics' ? 1 : 0.7}}
            >
              Analytics
            </button>
          </li>
          <li>
            <button 
              className="nav-link"
              onClick={() => setCurrentPage('settings')}
              style={{opacity: currentPage === 'settings' ? 1 : 0.7}}
            >
              Settings
            </button>
          </li>
        </ul>
      </nav>

      <div className="container">
        {currentPage === 'dashboard' && (
          <div className="page active">
            <h1 style={{marginBottom: '2rem', color: 'white'}}>Welcome to StudyFlow 🎓</h1>
            <div className="dashboard-grid">
              <PomodoroTimer />
              <StatsPanel />
            </div>
            <TaskManager />
          </div>
        )}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </div>
    </div>
  )
}

export default App
