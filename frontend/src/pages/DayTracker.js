import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import api from '../api/axios';
import HabitCheckbox from '../components/HabitCheckbox';
import ProgressRing from '../components/ProgressRing';

const DEFAULT_HABITS = {
  bathAndDress: false,
  breakfast: false,
  exercise: false,
  session1: false,
  lunch: false,
  session2: false,
  snacks: false,
  swimming: false,
  dinner: false,
  session3: false,
  sleep: false,
};

export default function DayTracker() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const doneCnt = Object.values(habits).filter(Boolean).length;
  const percent = Math.round((doneCnt / 11) * 100);

  useEffect(() => {
    api.get(`/habits/${date}`)
      .then(({ data }) => setHabits(data.habits))
      .catch(() => setHabits(DEFAULT_HABITS));
  }, [date]);

  const toggle = (key) => {
    setHabits((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/habits/${date}`, { habits });
      setSaved(true);
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const displayDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');

  return (
    <div className="page day-page">
      <button className="btn-back" onClick={() => navigate('/')}>← Back</button>
      <div className="day-header">
        <div>
          <h2>{displayDate}</h2>
          <p className="day-sub">{doneCnt} / 11 habits completed</p>
        </div>
        <ProgressRing percent={percent} size={90} stroke={9} />
      </div>

      <HabitCheckbox habits={habits} onChange={toggle} />

      <div className="day-actions">
        <button onClick={handleSave} className="btn-save" disabled={saving}>
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Day'}
        </button>
      </div>
    </div>
  );
}
