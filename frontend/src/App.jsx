import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import PackDetail from './pages/PackDetail.jsx'
import NewPack from './pages/NewPack.jsx'
import EditPack from './pages/EditPack.jsx'
import History from './pages/History.jsx'
import Users from './pages/Users.jsx'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <span className="logo">🥛 Chhas Tracker</span>
            <nav className="nav">
              <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
              <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>History</NavLink>
              <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Users</NavLink>
            </nav>
          </div>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pack/:id" element={<PackDetail />} />
            <Route path="/pack/:id/edit" element={<EditPack />} />
            <Route path="/new-pack" element={<NewPack />} />
            <Route path="/history" element={<History />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
