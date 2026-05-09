import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import api from '../api/axios';

const MONTH_NAMES = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

function DonutChart({ hit, missed, size = 140 }) {
  const total = hit + missed;
  if (!total) return <div style={{ width: size, height: size }} />;
  const pct = hit / total;
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#fee2e2" strokeWidth={18} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#22c55e" strokeWidth={18}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="50%" y="44%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size / 5} fontWeight="bold" fill="#1e293b">
        {Math.round(pct * 100)}%
      </text>
      <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size / 10} fill="#64748b">
        hit rate
      </text>
    </svg>
  );
}

export default function Goals() {
  const [data, setData] = useState(null);
  const [goal, setGoal] = useState(80);
  const [input, setInput] = useState('80');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGoal = async () => {
    try {
      const { data: d } = await api.get('/goal');
      setData(d);
      setGoal(d.goal);
      setInput(String(d.goal));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoal(); }, []);

  const handleSave = async () => {
    const val = parseInt(input, 10);
    if (!val || val < 1 || val > 100) return;
    setSaving(true);
    try {
      await api.put('/goal', { dailyGoal: val });
      setSaved(true);
      await fetchGoal();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><p className="loading">Loading…</p></div>;

  // Build last-30-days chart data from dailyBreakdown
  const last30Chart = (data?.dailyBreakdown || [])
    .slice(-30)
    .map((d) => ({
      date: d.date.slice(5),
      percent: d.percent,
      hit: d.hit,
    }));

  // Monthly summary table
  const monthlyRows = data?.dailyBreakdown
    ? (() => {
        const map = {};
        data.dailyBreakdown.forEach((d) => {
          const m = d.date.slice(0, 7);
          if (!map[m]) map[m] = { hit: 0, missed: 0, total: 0 };
          map[m].total++;
          if (d.hit) map[m].hit++; else map[m].missed++;
        });
        return Object.entries(map)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 6)
          .map(([month, s]) => ({
            month,
            label: `${MONTH_NAMES[month.slice(5)]} ${month.slice(0, 4)}`,
            ...s,
            hitRate: s.total ? Math.round((s.hit / s.total) * 100) : 0,
          }));
      })()
    : [];

  return (
    <div className="page">
      <h2 className="page-title">Goal Setting</h2>

      {/* ── Goal Setter ── */}
      <div className="goal-setter">
        <div className="goal-setter__left">
          <h3>Daily Completion Target</h3>
          <p>How many % of your habits do you want to complete each day?</p>
          <div className="goal-input-row">
            <input
              type="range" min="10" max="100" step="5"
              value={input}
              onChange={(e) => { setInput(e.target.value); setSaved(false); }}
              className="goal-slider"
            />
            <div className="goal-input-box">
              <input
                type="number" min="1" max="100"
                value={input}
                onChange={(e) => { setInput(e.target.value); setSaved(false); }}
              />
              <span>%</span>
            </div>
            <button
              className={`btn-save ${saved ? 'btn-saved' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Set Goal'}
            </button>
          </div>
        </div>
        <div className="goal-setter__right">
          <DonutChart hit={data?.hitDays || 0} missed={data?.missedDays || 0} />
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {data && (
        <div className="goal-cards">
          <div className="goal-card goal-card--green">
            <div className="goal-card__icon">✅</div>
            <div className="goal-card__val">{data.hitDays}</div>
            <div className="goal-card__lbl">Days Hit Goal</div>
          </div>
          <div className="goal-card goal-card--red">
            <div className="goal-card__icon">❌</div>
            <div className="goal-card__val">{data.missedDays}</div>
            <div className="goal-card__lbl">Days Missed</div>
          </div>
          <div className="goal-card goal-card--orange">
            <div className="goal-card__icon">🔥</div>
            <div className="goal-card__val">{data.goalStreak}</div>
            <div className="goal-card__lbl">Goal Streak</div>
          </div>
          <div className="goal-card goal-card--blue">
            <div className="goal-card__icon">📅</div>
            <div className="goal-card__val">{data.last30?.hit ?? 0}/{data.last30?.total ?? 0}</div>
            <div className="goal-card__lbl">Hit in Last 30 Days</div>
          </div>
        </div>
      )}

      {/* ── Last 30 Days Bar Chart ── */}
      {last30Chart.length > 0 && (
        <div className="goal-section">
          <h3>Last 30 Days vs Goal ({goal}%)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last30Chart} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}%`} labelFormatter={(l) => `Date: ${l}`} />
              <ReferenceLine y={goal} stroke="#6366f1" strokeDasharray="4 4"
                label={{ value: `Goal ${goal}%`, position: 'right', fontSize: 11, fill: '#6366f1' }}
              />
              <Bar dataKey="percent" radius={[4, 4, 0, 0]} maxBarSize={20}>
                {last30Chart.map((entry, i) => (
                  <Cell key={i} fill={entry.hit ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <span><span className="dot green" /> Hit goal</span>
            <span><span className="dot red" /> Missed goal</span>
            <span><span className="dot purple line" /> Target line</span>
          </div>
        </div>
      )}

      {/* ── Monthly Table ── */}
      {monthlyRows.length > 0 && (
        <div className="goal-section">
          <h3>Monthly Breakdown</h3>
          <table className="goal-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Days Tracked</th>
                <th>Hit</th>
                <th>Missed</th>
                <th>Hit Rate</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((row) => (
                <tr key={row.month}>
                  <td>{row.label}</td>
                  <td>{row.total}</td>
                  <td className="td-green">{row.hit}</td>
                  <td className="td-red">{row.missed}</td>
                  <td>
                    <div className="hit-rate-bar">
                      <div
                        className="hit-rate-fill"
                        style={{
                          width: `${row.hitRate}%`,
                          background: row.hitRate >= goal ? '#22c55e' : '#ef4444',
                        }}
                      />
                      <span>{row.hitRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!data?.totalDays && (
        <div className="goal-empty">
          <p>No habit data yet — start tracking days to see your goal stats!</p>
        </div>
      )}
    </div>
  );
}
