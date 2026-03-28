import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const WATER_KEY = 'cutcal_water'
const WATER_DATE_KEY = 'cutcal_water_date'
const LOG_KEY = 'cutcal_log'
const WATER_GOAL = 8
const CALORIE_GOAL = 1850

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'አንደምን አደርክ'
  if (hour < 17) return 'አንደምን አለህ'
  return 'አንደምን አመሹ'
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '{}') } catch { return {} }
}

const RING_R = 110
const RING_CIRC = 2 * Math.PI * RING_R

const MEAL_CATS = [
  { label: 'Breakfast', emoji: '🌅' },
  { label: 'Lunch',     emoji: '☀️' },
  { label: 'Dinner',    emoji: '🌙' },
  { label: 'Snack',     emoji: '🍿' },
]

export default function Home() {
  const navigate = useNavigate()
  const todayStr = todayKey()

  const [glasses, setGlasses] = useState(() => {
    const savedDate = localStorage.getItem(WATER_DATE_KEY)
    return savedDate === todayStr ? parseInt(localStorage.getItem(WATER_KEY) || '0', 10) : 0
  })

  const [log] = useState(loadLog)
  const todayEntries = log[todayStr] || []
  const totals = todayEntries.reduce(
    (acc, e) => ({ cal: acc.cal + e.cal, protein: acc.protein + e.protein, carbs: acc.carbs + e.carbs, fat: acc.fat + e.fat }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  )

  useEffect(() => {
    localStorage.setItem(WATER_KEY, String(glasses))
    localStorage.setItem(WATER_DATE_KEY, todayStr)
  }, [glasses, todayStr])

  const calLeft = Math.max(0, CALORIE_GOAL - totals.cal)
  const ringPct = Math.min(totals.cal / CALORIE_GOAL, 1)
  const ringOffset = RING_CIRC * (1 - ringPct)
  const ringColor = ringPct >= 1 ? '#f87171' : '#22c55e'

  const weeklyDelta = ((calLeft * 7) / 7700).toFixed(1)

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{getGreeting()}</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>CutCal 🇪🇹</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div style={{
          background: '#0a1a0a', border: '1px solid #16a34a',
          borderRadius: 20, padding: '6px 12px',
          fontSize: 13, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span>↘</span>
          <span>-{weeklyDelta}kg/wk</span>
        </div>
      </div>

      {/* Calorie Ring */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 4px' }}>
        <svg width={260} height={260} style={{ display: 'block' }}>
          {/* Track */}
          <circle cx={130} cy={130} r={RING_R}
            fill="none" stroke="#1a2e1a" strokeWidth={14} />
          {/* Progress */}
          <circle cx={130} cy={130} r={RING_R}
            fill="none" stroke={ringColor} strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={ringOffset}
            transform="rotate(-90 130 130)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          {/* Center text */}
          <text x={130} y={118} textAnchor="middle" fill={ringColor} fontSize={48} fontWeight={700}>
            {totals.cal}
          </text>
          <text x={130} y={142} textAnchor="middle" fill="#6b7280" fontSize={14}>
            of {CALORIE_GOAL.toLocaleString()} cal
          </text>
          <text x={130} y={166} textAnchor="middle" fill={ringColor} fontSize={18} fontWeight={600}>
            {calLeft.toLocaleString()} left
          </text>
        </svg>
      </div>

      {totals.cal === 0 && (
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
          Start logging your meals!
        </div>
      )}

      {/* Macros row — big icons */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        padding: '14px 20px',
        borderTop: '1px solid #1a1a1a',
        borderBottom: '1px solid #1a1a1a',
        marginBottom: 4,
      }}>
        {[
          { label: 'Protein', val: totals.protein, unit: 'g', icon: '🥩', color: '#3b82f6' },
          { label: 'Carbs',   val: totals.carbs,   unit: 'g', icon: '🍚', color: '#f97316' },
          { label: 'Fat',     val: totals.fat,     unit: 'g', icon: '🥑', color: '#a855f7' },
        ].map(({ label, val, unit, icon, color }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 32 }}>{icon}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color }}>{val}{unit}</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Water tracker — big icon */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 36, marginRight: 10 }}>💧</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Water</span>
            <span style={{ color: '#6b7280', fontSize: 14, marginLeft: 8 }}>{glasses}/8 glasses</span>
          </div>
          <button
            onClick={() => setGlasses(g => Math.max(0, g - 1))}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: '#1a1a1a', border: '1px solid #2e2e2e',
              color: '#fff', fontSize: 20, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >−</button>
          <button
            onClick={() => setGlasses(g => Math.min(WATER_GOAL, g + 1))}
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: '#1a1a1a', border: '1px solid #2e2e2e',
              color: '#fff', fontSize: 20, lineHeight: 1, marginLeft: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >+</button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: WATER_GOAL }).map((_, i) => {
            const filled = i < glasses
            return (
              <button
                key={i}
                onClick={() => setGlasses(filled ? i : i + 1)}
                style={{
                  flex: 1, height: 40, borderRadius: 8,
                  border: `1px solid ${filled ? '#1d4ed8' : '#2e2e2e'}`,
                  background: filled ? 'rgba(59,130,246,0.25)' : '#111',
                  fontSize: 16, transition: 'all 0.15s',
                }}
              >
                {filled ? '💧' : ''}
              </button>
            )
          })}
        </div>
      </div>

      {/* Meal categories */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderBottom: '1px solid #1a1a1a' }}>
        {MEAL_CATS.map(({ label, emoji }) => (
          <button
            key={label}
            onClick={() => navigate('/log', { state: { category: label } })}
            style={{
              flex: 1, background: '#111', border: '1px solid #2e2e2e',
              borderRadius: 14, padding: '12px 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              fontSize: 12, color: '#d1d5db', transition: 'background 0.15s',
            }}
          >
            <span style={{ fontSize: 28 }}>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Today's meals */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Today's Meals</span>
          <button
            onClick={() => navigate('/log')}
            style={{ color: '#22c55e', fontSize: 14, fontWeight: 500 }}
          >+ Add</button>
        </div>

        {todayEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>🔥</div>
            <div style={{ color: '#6b7280', fontSize: 15, marginBottom: 4 }}>No meals logged yet today</div>
            <div style={{ color: '#4b5563', fontSize: 13 }}>Tap a category above to start</div>
          </div>
        ) : (
          [...todayEntries].reverse().map(e => (
            <div key={e.id} style={{
              background: '#111', borderRadius: 12, padding: '12px 16px',
              marginBottom: 8, border: '1px solid #1e1e1e',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>{e.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {e.protein}g P · {e.carbs}g C · {e.fat}g F
                </div>
              </div>
              <div style={{ color: '#22c55e', fontWeight: 600 }}>{e.cal} cal</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
