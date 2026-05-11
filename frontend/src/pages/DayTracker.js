import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import api from '../api/axios';
import ProgressRing from '../components/ProgressRing';

export default function DayTracker() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [userTasks, setUserTasks] = useState([]); // [{_id, label, emoji}]
  const [checks, setChecks]       = useState({}); // { taskId: boolean }
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Load tasks and today's entry in parallel
        const [tasksRes, entryRes] = await Promise.allSettled([
          api.get('/tasks'),
          api.get(`/habits/${date}`),
        ]);

        const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.data : [];
        setUserTasks(tasks);

        // Build initial checks: all false by default
        const initChecks = {};
        tasks.forEach((t) => { initChecks[t._id] = false; });

        // Overlay saved values if entry exists
        if (entryRes.status === 'fulfilled') {
          const saved = entryRes.value.data.tasks || {};
          // saved might be a plain object or Map serialized as object
          Object.entries(saved).forEach(([k, v]) => {
            if (k in initChecks) initChecks[k] = Boolean(v);
          });
        }

        setChecks(initChecks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [date]);

  const toggle = (id) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const doneCnt = Object.values(checks).filter(Boolean).length;
  const total   = userTasks.length;
  const percent = total ? Math.round((doneCnt / total) * 100) : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/habits/${date}`, { tasks: checks });
      setSaved(true);
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const displayDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');

  if (loading) return <div className="page"><p className="loading">Loading…</p></div>;

  return (
    <div className="page day-page">
      <button className="btn-back" onClick={() => navigate('/')}>← Back</button>

      <div className="day-header">
        <div>
          <h2>{displayDate}</h2>
          <p className="day-sub">{doneCnt} / {total} tasks completed</p>
        </div>
        <ProgressRing percent={percent} size={90} stroke={9} />
      </div>

      {userTasks.length === 0 ? (
        <div className="tm-empty" style={{ marginTop: 20 }}>
          No tasks found.{' '}
          <button className="btn-back" onClick={() => navigate('/tasks')} style={{ display: 'inline' }}>
            Add tasks →
          </button>
        </div>
      ) : (
        <div className="habit-list">
          {userTasks.map((task) => (
            <label
              key={task._id}
              className={`habit-item ${checks[task._id] ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                checked={!!checks[task._id]}
                onChange={() => toggle(task._id)}
              />
              <span>{task.emoji} {task.label}</span>
            </label>
          ))}
        </div>
      )}

      <div className="day-actions">
        <button
          onClick={handleSave}
          className={`btn-save ${saved ? 'btn-saved' : ''}`}
          disabled={saving || userTasks.length === 0}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Day'}
        </button>
      </div>
    </div>
  );
}
