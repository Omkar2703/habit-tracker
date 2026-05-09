import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../api/axios';

export default function WeeklyStats() {
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/habits/stats/weekly')
      .then(({ data }) => setWeekly(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const barColor = (pct) => pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  if (loading) return <div className="page"><p>Loading stats…</p></div>;
  if (!weekly.length) return <div className="page"><p>No data yet. Start tracking!</p></div>;

  return (
    <div className="page">
      <h2>Weekly Success Tracker</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weekly} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" tickFormatter={(w) => `Wk ${w}`} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v) => `${v}%`} labelFormatter={(l) => `Week ${l}`} />
          <Bar dataKey="avgPercent" radius={[6, 6, 0, 0]}>
            {weekly.map((entry, i) => (
              <Cell key={i} fill={barColor(entry.avgPercent)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="weekly-table">
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Dates</th>
              <th>Avg %</th>
              <th>Days Tracked</th>
            </tr>
          </thead>
          <tbody>
            {weekly.map((w) => (
              <tr key={w.week}>
                <td>Week {w.week}</td>
                <td>{w.startDate} → {w.endDate}</td>
                <td>
                  <span className={`badge ${w.avgPercent >= 80 ? 'green' : w.avgPercent >= 50 ? 'yellow' : 'red'}`}>
                    {w.avgPercent}%
                  </span>
                </td>
                <td>{w.days.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
