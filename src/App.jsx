import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Log from './pages/Log'

const navStyle = {
  position: 'fixed', bottom: 0, left: 0, right: 0,
  background: '#1a1a24',
  borderTop: '1px solid #2e2e3d',
  display: 'flex',
  justifyContent: 'space-around',
  padding: '10px 0 max(10px, env(safe-area-inset-bottom))',
  zIndex: 100,
}

const linkStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  gap: 4, fontSize: 11, color: '#8888aa', transition: 'color .2s',
  padding: '4px 20px',
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ paddingBottom: 72 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/log" element={<Log />} />
        </Routes>
      </div>
      <nav style={navStyle}>
        <NavLink to="/" end style={({ isActive }) => ({ ...linkStyle, color: isActive ? '#7c6af5' : '#8888aa' })}>
          <span style={{ fontSize: 22 }}>🏠</span>
          Home
        </NavLink>
        <NavLink to="/log" style={({ isActive }) => ({ ...linkStyle, color: isActive ? '#7c6af5' : '#8888aa' })}>
          <span style={{ fontSize: 22 }}>📝</span>
          Log
        </NavLink>
      </nav>
    </BrowserRouter>
  )
}
