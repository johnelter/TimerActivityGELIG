import React, { useState, useEffect, forwardRef } from 'react';
import './App.css';

// --- Icons wrapped in forwardRef for DevTools visibility ---
const Pause = forwardRef((props, ref) => (
  <svg ref={ref} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
));

const Play = forwardRef((props, ref) => (
  <svg ref={ref} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
));

const Square = forwardRef((props, ref) => ( // Renamed from StopIcon to match screenshot
  <svg ref={ref} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
  </svg>
));

const Trash2 = forwardRef((props, ref) => ( // Renamed from TrashIcon to match screenshot
  <svg ref={ref} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
));

// --- Individual Timer Component ---
const TimerTile = ({ timer, togglePlayPause, stopTimer, deleteTimer }) => {
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isPlaying = (status) => status === 'Playing';
  const isPaused  = (status) => status === 'Paused' || status === 'Stopped';
  const isFinished = (status) => status === 'Finished';

  return (
    <div className="timer-card">
      <div className="timer-display">
        {formatTime(timer.currentSeconds)}
      </div>

      <div className="timer-controls">
        {/* PAUSED / STOPPED: dark green Play + Delete only */}
        {isPaused(timer.status) && (
          <>
            <button
              className="control-btn btn-play"
              onClick={() => togglePlayPause(timer.id)}
              title="Play"
            >
              <Play />
            </button>
            <button
              className="control-btn btn-delete"
              onClick={() => deleteTimer(timer.id)}
              title="Delete"
            >
              <Trash2 />
            </button>
          </>
        )}

        {/* PLAYING: amber Pause + red Stop + Delete */}
        {isPlaying(timer.status) && (
          <>
            <button
              className="control-btn btn-pause"
              onClick={() => togglePlayPause(timer.id)}
              title="Pause"
            >
              <Pause />
            </button>
            <button
              className="control-btn btn-stop"
              onClick={() => stopTimer(timer.id)}
              title="Stop & Reset"
            >
              <Square />
            </button>
            <button
              className="control-btn btn-delete"
              onClick={() => deleteTimer(timer.id)}
              title="Delete"
            >
              <Trash2 />
            </button>
          </>
        )}

        {/* FINISHED: dark green Play + red Stop + Delete */}
        {isFinished(timer.status) && (
          <>
            <button
              className="control-btn btn-play"
              onClick={() => togglePlayPause(timer.id)}
              title="Restart"
            >
              <Play />
            </button>
            <button
              className="control-btn btn-stop"
              onClick={() => stopTimer(timer.id)}
              title="Reset"
            >
              <Square />
            </button>
            <button
              className="control-btn btn-delete"
              onClick={() => deleteTimer(timer.id)}
              title="Delete"
            >
              <Trash2 />
            </button>
          </>
        )}
      </div>

      <div className="timer-description">
        {timer.description}
      </div>

      <div className="timer-status">
        Status: {timer.status}
      </div>
    </div>
  );
};

// --- Timer Grid Component ---
const Timer = ({ timers, togglePlayPause, stopTimer, deleteTimer }) => {
  return (
    <div className="timers-grid">
      {timers.map(timer => (
        <TimerTile 
          key={timer.id} 
          timer={timer} 
          togglePlayPause={togglePlayPause}
          stopTimer={stopTimer}
          deleteTimer={deleteTimer}
        />
      ))}
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [timers, setTimers] = useState([]);
  const [secondsInput, setSecondsInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');

  // Global timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers =>
        prevTimers.map(timer => {
          if (timer.status === 'Playing' && timer.currentSeconds > 0) {
            return { ...timer, currentSeconds: timer.currentSeconds - 1 };
          } else if (timer.status === 'Playing' && timer.currentSeconds <= 0) {
            return { ...timer, status: 'Finished', currentSeconds: 0 };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    const parsedSeconds = parseInt(secondsInput, 10);
    if (isNaN(parsedSeconds) || parsedSeconds <= 0) return;

    const newTimer = {
      id: Date.now().toString(),
      initialSeconds: parsedSeconds,
      currentSeconds: parsedSeconds,
      description: descriptionInput || 'Timer',
      status: 'Paused' // ← starts Paused, not Playing
    };

    setTimers([...timers, newTimer]);
    handleClear();
  };

  const handleClear = () => {
    setSecondsInput('');
    setDescriptionInput('');
  };

  const togglePlayPause = (id) => {
    setTimers(timers.map(timer => {
      if (timer.id === id) {
        if (timer.status === 'Playing') return { ...timer, status: 'Paused' };
        if (timer.status === 'Paused' || timer.status === 'Stopped' || timer.status === 'Finished') {
          return { ...timer, status: 'Playing' };
        }
      }
      return timer;
    }));
  };

  const stopTimer = (id) => {
    setTimers(timers.map(timer => {
      if (timer.id === id) {
        return { ...timer, status: 'Stopped', currentSeconds: timer.initialSeconds };
      }
      return timer;
    }));
  };

  const deleteTimer = (id) => {
    setTimers(timers.filter(timer => timer.id !== id));
  };

  return (
    <div className="app-container">
      <h1 className="main-title">Timers</h1>

      <div className="create-timer-card">
        <h2>Create Timer</h2>

        <div className="input-group">
          <label>Seconds</label>
          <input
            type="number"
            placeholder="90"
            value={secondsInput}
            onChange={(e) => setSecondsInput(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea
            placeholder="Focus Session"
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button className="btn-save" onClick={handleSave}>Save</button>
          <button className="btn-clear" onClick={handleClear}>Clear</button>
        </div>
      </div>

      <div className="timers-divider"></div>

      {/* Replaced your inline map with the new Timer component */}
      <Timer 
        timers={timers} 
        togglePlayPause={togglePlayPause} 
        stopTimer={stopTimer} 
        deleteTimer={deleteTimer} 
      />
    </div>
  );
}