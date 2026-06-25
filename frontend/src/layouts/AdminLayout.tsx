import {
  CalendarDays,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Settings,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Logo from '../components/common/Logo'
import useAuth from '../hooks/useAuth'
import './AdminLayout.css'

type NavigationItem = [string, string, LucideIcon, boolean?]

const navigation: NavigationItem[] = [
  ['Tableau de bord', '/admin', LayoutDashboard, true],
  ['Membres', '/admin/membres', Users],
  ['Cotisations', '/admin/cotisations', WalletCards],
  ['Actualités', '/admin/actualites', Newspaper],
  ['Événements', '/admin/evenements', CalendarDays],
  ['Galerie', '/admin/galerie', Images],
  ['Documents', '/admin/documents', FileText],
  ['Messages', '/admin/messages', Mail],
  ['Paramètres', '/admin/parametres', Settings],
]

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <button
        type="button"
        className="admin-shell__mobile-menu"
        aria-label={sidebarOpen ? 'Fermer le menu admin' : 'Ouvrir le menu admin'}
        onClick={() => setSidebarOpen((open) => !open)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? 'admin-sidebar--open' : ''
        }`}
      >
        <div className="admin-sidebar__brand">
          <Logo light />
          <span>Dashboard</span>
        </div>

        <nav aria-label="Navigation administration">
          {navigation.map(([label, href, Icon, end]) => (
            <NavLink
              key={label}
              to={href}
              end={end}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="admin-sidebar__logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </aside>

      <div className="admin-shell__content">
        <header className="admin-topbar">
          <div>
            <span>Bienvenue,</span>
            <strong>
              {admin?.prenom} {admin?.nom}
            </strong>
          </div>
          <span className="admin-topbar__avatar">
            {admin?.prenom?.[0]}
            {admin?.nom?.[0]}
          </span>
        </header>
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
