import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const EMOJI_OPTIONS = [
  '✅','📚','🏋️','🛁','🍳','🍱','🍎','🍽️','🏊','😴','💧','🧘','🚶',
  '💊','📝','🎯','🎨','🎵','💻','📞','🧹','🛒','🐕','🌿','⭐','🔥',
];

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="emoji-picker-wrap">
      <button type="button" className="emoji-trigger" onClick={() => setOpen(!open)}>
        {value} <span className="emoji-caret">▾</span>
      </button>
      {open && (
        <div className="emoji-grid">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e} type="button"
              className={`emoji-opt ${value === e ? 'selected' : ''}`}
              onClick={() => { onChange(e); setOpen(false); }}
            >{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TaskManager() {
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [newLabel, setNewLabel]   = useState('');
  const [newEmoji, setNewEmoji]   = useState('✅');
  const [adding, setAdding]       = useState(false);
  const [editId, setEditId]       = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editEmoji, setEditEmoji] = useState('✅');
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [error, setError]         = useState('');

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // ── Add ──
  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);
    setError('');
    try {
      const { data } = await api.post('/tasks', { label: newLabel.trim(), emoji: newEmoji });
      setTasks((prev) => [...prev, data]);
      setNewLabel('');
      setNewEmoji('✅');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task');
    } finally {
      setAdding(false);
    }
  };

  // ── Edit ──
  const startEdit = (task) => {
    setEditId(task._id);
    setEditLabel(task.label);
    setEditEmoji(task.emoji);
  };

  const handleSaveEdit = async (id) => {
    if (!editLabel.trim()) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put(`/tasks/${id}`, { label: editLabel.trim(), emoji: editEmoji });
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
      setEditId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? Past history is kept.')) return;
    setDeleting(id);
    setError('');
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  // ── Reorder ──
  const move = async (index, dir) => {
    const newTasks = [...tasks];
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= newTasks.length) return;
    [newTasks[index], newTasks[swapIndex]] = [newTasks[swapIndex], newTasks[index]];
    setTasks(newTasks);
    try {
      await api.put('/tasks/batch/reorder', { ids: newTasks.map((t) => t._id) });
    } catch (err) {
      fetchTasks(); // revert on failure
    }
  };

  if (loading) return <div className="page"><p className="loading">Loading tasks…</p></div>;

  return (
    <div className="page tm-page">
      <h2 className="page-title">Manage Tasks</h2>
      <p className="tm-sub">Add, edit, reorder or delete your daily habits.</p>

      {error && <div className="error-msg">{error}</div>}

      {/* ── Add New Task ── */}
      <div className="tm-add-card">
        <h3>➕ Add New Task</h3>
        <div className="tm-add-row">
          <EmojiPicker value={newEmoji} onChange={setNewEmoji} />
          <input
            type="text"
            className="tm-input"
            placeholder="Task name e.g. Meditate"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            maxLength={50}
          />
          <button
            className="tm-btn-add"
            onClick={handleAdd}
            disabled={adding || !newLabel.trim()}
          >
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>

      {/* ── Task List ── */}
      <div className="tm-list">
        <div className="tm-list-header">
          <span>Your Tasks ({tasks.length})</span>
          {/* <span className="tm-hint">Drag order affects DayTracker</span> */}
        </div>

        {tasks.length === 0 && (
          <div className="tm-empty">No tasks yet — add one above!</div>
        )}

        {tasks.map((task, index) => (
          <div key={task._id} className={`tm-item ${editId === task._id ? 'editing' : ''}`}>
            {/* Reorder buttons */}
            <div className="tm-order-btns">
              <button
                className="tm-order-btn"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                title="Move up"
              >▲</button>
              <button
                className="tm-order-btn"
                onClick={() => move(index, 1)}
                disabled={index === tasks.length - 1}
                title="Move down"
              >▼</button>
            </div>

            {/* Task content */}
            {editId === task._id ? (
              <div className="tm-edit-row">
                <EmojiPicker value={editEmoji} onChange={setEditEmoji} />
                <input
                  className="tm-input"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task._id)}
                  autoFocus
                  maxLength={50}
                />
                <button
                  className="tm-btn-save"
                  onClick={() => handleSaveEdit(task._id)}
                  disabled={saving}
                >{saving ? '…' : '✓'}</button>
                <button
                  className="tm-btn-cancel"
                  onClick={() => setEditId(null)}
                >✕</button>
              </div>
            ) : (
              <div className="tm-task-info">
                <span className="tm-task-emoji">{task.emoji}</span>
                <span className="tm-task-label">{task.label}</span>
              </div>
            )}

            {/* Action buttons */}
            {editId !== task._id && (
              <div className="tm-actions">
                <button
                  className="tm-btn-edit"
                  onClick={() => startEdit(task)}
                  title="Edit"
                >✏️</button>
                <button
                  className="tm-btn-delete"
                  onClick={() => handleDelete(task._id)}
                  disabled={deleting === task._id}
                  title="Delete"
                >{deleting === task._id ? '…' : '🗑️'}</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
