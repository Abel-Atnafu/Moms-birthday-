import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Log from './pages/Log'
import History from './pages/History'

const linkStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: 3, fontSize: 11, color: '#6b7280', transition: 'color .2s',
  padding: '6px 24px', textDecoration: 'none',
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ paddingBottom: 72 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/log" element={<Log />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#0a0a0a',
        borderTop: '1px solid #1e1e1e',
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        zIndex: 100,
      }}>
        <NavLink to="/" end style={({ isActive }) => ({ ...linkStyle, color: isActive ? '#22c55e' : '#6b7280' })}>
          <span style={{ fontSize: 24 }}>🏠</span>
          Home
        </NavLink>
        <NavLink to="/log" style={({ isActive }) => ({ ...linkStyle, color: isActive ? '#22c55e' : '#6b7280' })}>
          <span style={{ fontSize: 24 }}>📷</span>
          Log Meal
        </NavLink>
        <NavLink to="/history" style={({ isActive }) => ({ ...linkStyle, color: isActive ? '#22c55e' : '#6b7280' })}>
          <span style={{ fontSize: 24 }}>🕐</span>
          History
        </NavLink>
      </nav>
    </BrowserRouter>
  )
}
