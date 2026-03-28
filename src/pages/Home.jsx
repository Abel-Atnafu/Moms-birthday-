import React, { useState, useEffect } from 'react'

const WATER_KEY = 'cutcal_water'
const WATER_DATE_KEY = 'cutcal_water_date'
const WATER_GOAL = 8

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { am: 'ቀባ ነግ', en: 'Good morning' }
  if (hour < 17) return { am: 'ተስፈጥ ነግ', en: 'Good afternoon' }
  return { am: 'መቕሰም ተስፈት', en: 'Good evening' }
}

export default function Home() {
  const greeting = getGreeting()

  // Water tracker — resets each day
  const todayStr = new Date().toISOString().slice(0, 10)
  const [glasses, setGlasses] = useState(() => {
    const savedDate = localStorage.getItem(WATER_DATE_KEY)
    if (savedDate === todayStr) {
      return parseInt(localStorage.getItem(WATER_KEY) || '0', 10)
    }
    return 0
  })

  useEffect(() => {
    localStorage.setItem(WATER_KEY, String(glasses))
    localStorage.setItem(WATER_DATE_KEY, todayStr)
  }, [glasses, todayStr])

  const toggleGlass = (idx) => {
    // Tap filled glass to unfill, tap empty to fill up to that point
    if (idx < glasses) {
      setGlasses(idx)
    } else {
      setGlasses(idx + 1)
    }
  }

  const pct = Math.round((glasses / WATER_GOAL) * 100)

  return (
    <div style={{ padding: '24px 20px', maxWidth: 480, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{
        background: 'linear-gradient(135deg, #2d1f6e 0%, #1a1a24 100%)',
        borderRadius: 20,
        padding: '28px 24px',
        marginBottom: 24,
        border: '1px solid #3d2e8c',
      }}>
        <div style={{ fontSize: 13, color: '#a89af5', marginBottom: 6, letterSpacing: 1 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4, letterSpacing: -0.5 }}>
          {greeting.am}
        </div>
        <div style={{ fontSize: 15, color: '#a89af5' }}>{greeting.en}</div>
      </div>

      {/* Water Tracker */}
      <div style={{
        background: '#1a1a24',
        borderRadius: 20,
        padding: '20px 24px',
        border: '1px solid #2e2e3d',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>💧 Water Tracker</div>
            <div style={{ fontSize: 13, color: '#8888aa' }}>{glasses} of {WATER_GOAL} glasses today</div>
          </div>
          <div style={{
            fontSize: 22, fontWeight: 700,
            color: pct >= 100 ? '#4ade80' : '#5eead4',
          }}>
            {pct}%
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6, background: '#2e2e3d', borderRadius: 99, marginBottom: 16, overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(pct, 100)}%`,
            background: pct >= 100
              ? 'linear-gradient(90deg, #4ade80, #22d3ee)'
              : 'linear-gradient(90deg, #5eead4, #7c6af5)',
            borderRadius: 99,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Glass buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: WATER_GOAL }).map((_, i) => {
            const filled = i < glasses
            return (
              <button
                key={i}
                onClick={() => toggleGlass(i)}
                style={{
                  flex: '1 0 calc(12.5% - 8px)',
                  minWidth: 36,
                  height: 44,
                  borderRadius: 10,
                  border: `2px solid ${filled ? '#5eead4' : '#2e2e3d'}`,
                  background: filled ? 'rgba(94,234,212,0.15)' : '#23232f',
                  fontSize: 20,
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title={filled ? 'Tap to remove' : 'Tap to add'}
              >
                {filled ? '💧' : '□'}
              </button>
            )
          })}
        </div>

        {glasses >= WATER_GOAL && (
          <div style={{
            marginTop: 12, textAlign: 'center',
            color: '#4ade80', fontSize: 14, fontWeight: 600,
          }}>
            ✨ Goal reached! Great job staying hydrated.
          </div>
        )}
      </div>

      {/* Quick nav */}
      <button
        onClick={() => window.location.href = '/log'}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #7c6af5, #5eead4)',
          borderRadius: 14,
          padding: '16px',
          fontSize: 16,
          fontWeight: 600,
          color: '#fff',
          letterSpacing: 0.3,
        }}
      >
        + Log Food
      </button>
    </div>
  )
}
