import { useLocation } from 'react-router-dom'
import './AdminPlaceholderPage.css'

const labels: Record<string, string> = {
  membres: 'Membres',
  cotisations: 'Cotisations',
  actualites: 'Actualités',
  evenements: 'Événements',
  galerie: 'Galerie',
  documents: 'Documents',
  messages: 'Messages',
  parametres: 'Paramètres',
}

function AdminPlaceholderPage() {
  const location = useLocation()
  const section = location.pathname.split('/').filter(Boolean).at(-1)
  const label = labels[section || ''] || 'Administration'

  return (
    <main className="admin-placeholder">
      <p>Module en préparation</p>
      <h1>{label}</h1>
      <span>
        Cette route est protégée et prête à recevoir son interface CRUD.
      </span>
    </main>
  )
}

export default AdminPlaceholderPage
