import React, { useState } from 'react'

const LOG_KEY = 'cutcal_log'

function loadLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '{}') } catch { return {} }
}

export default function History() {
  const [log] = useState(loadLog)
  const dates = Object.keys(log).sort((a, b) => b.localeCompare(a))

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', padding: '20px 16px 80px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>History</h1>
      {dates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          No history yet. Start logging!
        </div>
      ) : (
        dates.map(date => {
          const entries = log[date] || []
          const total = entries.reduce((s, e) => s + e.cal, 0)
          return (
            <div key={date} style={{
              background: '#111', borderRadius: 14, padding: '14px 16px',
              marginBottom: 12, border: '1px solid #1e1e1e',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>
                  {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span style={{ color: '#22c55e', fontWeight: 600 }}>{total} cal</span>
              </div>
              {entries.map(e => (
                <div key={e.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 13, color: '#9ca3af', paddingTop: 4,
                  borderTop: '1px solid #1e1e1e', marginTop: 4,
                }}>
                  <span>{e.name}</span>
                  <span>{e.cal} cal</span>
                </div>
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}
