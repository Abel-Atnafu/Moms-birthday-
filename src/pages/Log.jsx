import React, { useState, useRef } from 'react'
import { ETHIOPIAN_FOODS } from '../data/ethiopianFoods'

const LOG_KEY = 'cutcal_log'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '{}') } catch { return {} }
}

export default function Log() {
  const [log, setLog] = useState(loadLog)
  const [form, setForm] = useState({ name: '', cal: '', protein: '', carbs: '', fat: '' })
  const [photoStatus, setPhotoStatus] = useState('')
  const fileRef = useRef()

  const today = todayKey()
  const todayEntries = log[today] || []
  const totals = todayEntries.reduce(
    (acc, e) => ({ cal: acc.cal + e.cal, protein: acc.protein + e.protein, carbs: acc.carbs + e.carbs, fat: acc.fat + e.fat }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const saveEntry = (entry) => {
    const updated = { ...log, [today]: [...(log[today] || []), { ...entry, id: Date.now() }] }
    setLog(updated)
    localStorage.setItem(LOG_KEY, JSON.stringify(updated))
    setForm({ name: '', cal: '', protein: '', carbs: '', fat: '' })
  }

  const removeEntry = (id) => {
    const updated = { ...log, [today]: (log[today] || []).filter(e => e.id !== id) }
    setLog(updated)
    localStorage.setItem(LOG_KEY, JSON.stringify(updated))
  }

  const handleQuickPick = (food) => {
    setForm({ name: food.name, cal: food.cal, protein: food.protein, carbs: food.carbs, fat: food.fat })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.cal) return
    saveEntry({
      name: form.name,
      cal: Number(form.cal),
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    })
  }

  // AI photo analysis — builds a descriptive prompt for Ethiopian cuisine recognition
  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoStatus('Analyzing photo…')

    // Build a vision-ready prompt that specifically covers Ethiopian cuisine
    const prompt = [
      'Identify the food(s) in this image and estimate calories and macros per serving.',
      'This may be Ethiopian cuisine — look for injera (spongy flatbread), stews (wats) like doro wat,',
      'shiro, misir, tibs, kitfo, or fasting platters (beyaynetu).',
      'Respond with JSON: { "name": "...", "cal": 0, "protein": 0, "carbs": 0, "fat": 0 }',
    ].join(' ')

    try {
      // Convert to base64
      const base64 = await new Promise((res) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result.split(',')[1])
        reader.readAsDataURL(file)
      })

      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      if (!apiKey) {
        setPhotoStatus('⚠️ Set VITE_OPENAI_API_KEY in your .env to enable AI photo analysis.')
        return
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } },
            ],
          }],
          max_tokens: 200,
        }),
      })

      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || ''
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        setForm({
          name: parsed.name || '',
          cal: parsed.cal || '',
          protein: parsed.protein || '',
          carbs: parsed.carbs || '',
          fat: parsed.fat || '',
        })
        setPhotoStatus('✅ Food detected! Review and save below.')
      } else {
        setPhotoStatus('Could not parse response. Try again.')
      }
    } catch (err) {
      setPhotoStatus(`Error: ${err.message}`)
    }
  }

  const cardStyle = {
    background: '#1a1a24',
    borderRadius: 16,
    padding: '16px 18px',
    border: '1px solid #2e2e3d',
    marginBottom: 16,
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, letterSpacing: -0.5 }}>Food Log</h1>

      {/* Daily totals */}
      <div style={{
        ...cardStyle,
        background: 'linear-gradient(135deg, #1e1640 0%, #1a1a24 100%)',
        border: '1px solid #3d2e8c',
      }}>
        <div style={{ fontSize: 13, color: '#a89af5', marginBottom: 8 }}>Today's Totals</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[['Calories', totals.cal, '#fbbf24'], ['Protein', `${totals.protein}g`, '#f472b6'], ['Carbs', `${totals.carbs}g`, '#60a5fa'], ['Fat', `${totals.fat}g`, '#fb923c']].map(([label, val, color]) => (
            <div key={label}>
              <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
              <div style={{ fontSize: 11, color: '#8888aa' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ethiopian quick-picks */}
      <div style={cardStyle}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#a89af5' }}>
          🌍 Ethiopian Foods — tap to auto-fill
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ETHIOPIAN_FOODS.map((food) => (
            <button
              key={food.name}
              onClick={() => handleQuickPick(food)}
              style={{
                background: '#23232f',
                border: '1px solid #3a3a50',
                borderRadius: 10,
                padding: '7px 12px',
                fontSize: 13,
                color: '#e0e0f0',
                transition: 'all 0.15s',
                display: 'flex', gap: 5, alignItems: 'center',
              }}
            >
              <span>{food.emoji}</span>
              <span>{food.name}</span>
              <span style={{ color: '#fbbf24', fontSize: 11, marginLeft: 2 }}>{food.cal}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual / AI entry form */}
      <div style={cardStyle}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Add Entry</div>

        {/* Photo analysis */}
        <div style={{ marginBottom: 14 }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileRef.current.click()}
            style={{
              width: '100%',
              background: '#23232f',
              border: '1px dashed #3a3a50',
              borderRadius: 10,
              padding: '12px',
              fontSize: 14,
              color: '#8888aa',
            }}
          >
            📸 Analyze Photo (AI)
          </button>
          {photoStatus && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#a89af5', textAlign: 'center' }}>
              {photoStatus}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <input
              placeholder="Food name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <input placeholder="Calories" type="number" min="0" value={form.cal}     onChange={e => setForm(f => ({ ...f, cal: e.target.value }))} />
            <input placeholder="Protein (g)" type="number" min="0" value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} />
            <input placeholder="Carbs (g)"   type="number" min="0" value={form.carbs}   onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))} />
            <input placeholder="Fat (g)"     type="number" min="0" value={form.fat}     onChange={e => setForm(f => ({ ...f, fat: e.target.value }))} />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #7c6af5, #5eead4)',
              borderRadius: 10,
              padding: '12px',
              fontSize: 15,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            Save Entry
          </button>
        </form>
      </div>

      {/* Today's entries */}
      {todayEntries.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#8888aa' }}>Logged Today</div>
          {[...todayEntries].reverse().map(entry => (
            <div key={entry.id} style={{
              ...cardStyle,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px',
            }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{entry.name}</div>
                <div style={{ fontSize: 12, color: '#8888aa' }}>
                  {entry.cal} cal &middot; {entry.protein}g protein &middot; {entry.carbs}g carbs &middot; {entry.fat}g fat
                </div>
              </div>
              <button
                onClick={() => removeEntry(entry.id)}
                style={{ color: '#f87171', fontSize: 18, padding: '4px 8px', borderRadius: 6 }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
