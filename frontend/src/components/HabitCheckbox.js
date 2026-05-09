import React from 'react';

const HABIT_LABELS = {
  bathAndDress: '🛁 Bath & Dress',
  breakfast: '🍳 Breakfast',
  exercise: '🏋️ Exercise / Gym',
  session1: '📚 Session 1',
  lunch: '🍱 Lunch',
  session2: '📚 Session 2',
  snacks: '🍎 Snacks',
  swimming: '🏊 Swimming',
  dinner: '🍽️ Dinner',
  session3: '📚 Session 3',
  sleep: '😴 Sleep',
};

export default function HabitCheckbox({ habits, onChange, readOnly }) {
  return (
    <div className="habit-list">
      {Object.entries(HABIT_LABELS).map(([key, label]) => (
        <label key={key} className={`habit-item ${habits[key] ? 'checked' : ''}`}>
          <input
            type="checkbox"
            checked={!!habits[key]}
            onChange={() => !readOnly && onChange(key)}
            disabled={readOnly}
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}

export { HABIT_LABELS };
