import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import api from '../api/axios';
import ProgressRing from '../components/ProgressRing';

const HABIT_LABELS = {
  bathAndDress: 'Bath & Dress',
  breakfast: 'Breakfast',
  exercise: 'Exercise',
  session1: 'Session 1',
  lunch: 'Lunch',
  session2: 'Session 2',
  snacks: 'Snacks',
  swimming: 'Swimming',
  dinner: 'Dinner',
  session3: 'Session 3',
  sleep: 'Sleep',
};

function computeStats(entries) {
  const values = Object.values(entries);
  if (!values.length) return null;

  // Month avg
  const monthAvg = Math.round(values.reduce((s, e) => s + e.percentDone, 0) / values.length);

  // Days tracked
  const daysTracked = values.length;

  // Current streak (sorted by date desc)
  const sorted = [...values].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const e of sorted) {
    if (e.doneCnt > 0) streak++;
    else break;
  }

  // Best & worst habit
  const habitTotals = {};
  Object.keys(HABIT_LABELS).forEach((k) => { habitTotals[k] = 0; });
  values.forEach((e) => {
    Object.keys(HABIT_LABELS).forEach((k) => {
      if (e.habits?.[k]) habitTotals[k]++;
    });
  });
  const bestKey = Object.entries(habitTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
  const worstKey = Object.entries(habitTotals).sort((a, b) => a[1] - b[1])[0]?.[0];

  // This week avg (last 7 days)
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekEntries = values.filter((e) => {
    const diff = (new Date(today) - new Date(e.date)) / 86400000;
    return diff >= 0 && diff < 7;
  });
  const weekAvg = weekEntries.length
    ? Math.round(weekEntries.reduce((s, e) => s + e.percentDone, 0) / weekEntries.length)
    : null;

  return { monthAvg, daysTracked, streak, bestHabit: HABIT_LABELS[bestKey], worstHabit: HABIT_LABELS[worstKey], weekAvg };
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [allEntries, setAllEntries] = useState({});
  const navigate = useNavigate();

  const monthKey = format(currentMonth, 'yyyy-MM');

  const fetchMonth = useCallback(async () => {
    try {
      const { data } = await api.get(`/habits?month=${monthKey}`);
      const map = {};
      data.forEach((e) => { map[e.date] = e; });
      setEntries(map);
    } catch (err) {
      console.error(err);
    }
  }, [monthKey]);

  // Fetch all entries once for streak & habit stats
  useEffect(() => {
    api.get('/habits').then(({ data }) => {
      const map = {};
      data.forEach((e) => { map[e.date] = e; });
      setAllEntries(map);
    }).catch(console.error);
  }, []);

  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const stats = computeStats({ ...allEntries });
  const isCurrentMonth = monthKey === format(new Date(), 'yyyy-MM');

  return (
    <div className="page">

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="stats-grid">
          <StatCard
            icon="🔥"
            label="Current Streak"
            value={`${stats.streak} day${stats.streak !== 1 ? 's' : ''}`}
            sub="consecutive days active"
            color="orange"
          />
          <StatCard
            icon="📅"
            label="Days Tracked"
            value={stats.daysTracked}
            sub={`this month: ${Object.keys(entries).length}`}
            color="blue"
          />
          <StatCard
            icon="⭐"
            label="Best Habit"
            value={stats.bestHabit}
            sub="most consistent"
            color="green"
          />
          <StatCard
            icon="📉"
            label="Weakest Habit"
            value={stats.worstHabit}
            sub="needs attention"
            color="red"
          />
          <StatCard
            icon="✅"
            label="This Week"
            value={stats.weekAvg !== null ? `${stats.weekAvg}%` : '—'}
            sub="7-day average"
            color="purple"
          />
          <StatCard
            icon="📊"
            label="Month Avg"
            value={`${stats.monthAvg}%`}
            sub={format(new Date(), 'MMMM yyyy')}
            color="indigo"
          />
        </div>
      )}

      {/* ── Calendar ── */}
      <div className="dashboard-header">
        <button onClick={prevMonth} className="btn-nav">‹</button>
        <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth} className="btn-nav">›</button>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="cal-header">{d}</div>
        ))}
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="cal-cell empty" />
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const entry = entries[key];
          const pct = entry?.percentDone ?? null;
          const isToday = key === format(new Date(), 'yyyy-MM-dd');
          return (
            <div
              key={key}
              className={`cal-cell ${isToday ? 'today' : ''} ${pct !== null ? 'has-data' : ''}`}
              onClick={() => navigate(`/day/${key}`)}
            >
              <span className="cal-date">{format(day, 'd')}</span>
              {pct !== null ? (
                <ProgressRing percent={pct} size={48} stroke={5} />
              ) : (
                <div className="cal-empty-ring" />
              )}
            </div>
          );
        })}
      </div>

      <div className="legend">
        <span className="legend-dot green" /> ≥80% &nbsp;
        <span className="legend-dot yellow" /> 50–79% &nbsp;
        <span className="legend-dot red" /> &lt;50%
      </div>
    </div>
  );
}