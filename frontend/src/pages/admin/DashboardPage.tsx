import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  Images,
  Mail,
  Newspaper,
  Plus,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardData } from '../../services/dashboardService'
import type { DashboardData } from '../../types/api'
import './DashboardPage.css'

type MetricKey = 'members' | 'fees' | 'events' | 'messages'
type StatCard = [string, MetricKey, LucideIcon, string]
type QuickAction = [string, string, LucideIcon, string]

const emptyDashboard: DashboardData = {
  members: [],
  fees: [],
  publications: [],
  albums: [],
  documents: [],
  messages: [],
  hasPartialError: false,
}

const cardDefinitions: StatCard[] = [
  ['Membres', 'members', Users, 'blue'],
  ['Cotisations', 'fees', CircleDollarSign, 'green'],
  ['Événements', 'events', CalendarDays, 'red'],
  ['Messages non lus', 'messages', Mail, 'orange'],
]

const quickActions: QuickAction[] = [
  ['Ajouter un membre', '/admin/membres', Users, 'blue'],
  ['Ajouter une actualité', '/admin/actualites', Newspaper, 'red'],
  ['Ajouter un événement', '/admin/evenements', CalendarDays, 'orange'],
  ['Créer un album', '/admin/galerie', Images, 'green'],
  ['Ajouter un document', '/admin/documents', FileText, 'blue'],
]

function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    getDashboardData(controller.signal)
      .then(setDashboard)
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [])

  const metrics = useMemo(
    () => ({
      members: dashboard.members.length,
      fees: dashboard.fees.filter((fee) => fee.paymentStatus === 'paid').length,
      events: dashboard.publications.filter(
        (publication) => publication.type === 'event',
      ).length,
      messages: dashboard.messages.filter(
        (message) => message.statut === 'unread',
      ).length,
    }),
    [dashboard],
  )

  const recentMembers = dashboard.members.slice(0, 5)
  const recentPublications = dashboard.publications.slice(0, 5)

  return (
    <main className="dashboard-page">
      <div className="dashboard-page__heading">
        <div>
          <p>Vue d&apos;ensemble</p>
          <h1>Tableau de bord</h1>
        </div>
        <Link to="/" target="_blank">
          Voir le site public
        </Link>
      </div>

      {dashboard.hasPartialError && (
        <p className="dashboard-page__warning">
          Certaines données n&apos;ont pas pu être chargées.
        </p>
      )}

      <section className="dashboard-stats" aria-label="Statistiques">
        {cardDefinitions.map(([label, key, Icon, color]) => (
          <article className="stat-card" key={key}>
            <div>
              <span>{label}</span>
              <strong>{isLoading ? '...' : metrics[key]}</strong>
              <small>Données actuelles</small>
            </div>
            <span className={`stat-card__icon stat-card__icon--${color}`}>
              <Icon size={23} />
            </span>
          </article>
        ))}
      </section>

      <section className="dashboard-columns">
        <article className="dashboard-panel">
          <div className="dashboard-panel__heading">
            <h2>Activités récentes</h2>
            <Newspaper size={18} />
          </div>
          <div className="activity-list">
            {recentPublications.length ? (
              recentPublications.map((publication) => (
                <div key={publication._id}>
                  <span className="activity-list__dot" />
                  <div>
                    <strong>{publication.title}</strong>
                    <small>
                      {publication.type === 'event'
                        ? 'Événement'
                        : 'Publication'}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p className="dashboard-empty">Aucune activité récente.</p>
            )}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel__heading">
            <h2>État des contenus</h2>
            <FileText size={18} />
          </div>
          <div className="content-summary">
            <div>
              <span>Publications</span>
              <strong>{dashboard.publications.length}</strong>
            </div>
            <div>
              <span>Albums</span>
              <strong>{dashboard.albums.length}</strong>
            </div>
            <div>
              <span>Documents publiés</span>
              <strong>
                {
                  dashboard.documents.filter(
                    (document) => document.status === 'published',
                  ).length
                }
              </strong>
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-panel dashboard-members">
        <div className="dashboard-panel__heading">
          <h2>Membres récents</h2>
          <Link to="/admin/membres">Voir tous les membres</Link>
        </div>
        <div className="dashboard-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Date d&apos;adhésion</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentMembers.length ? (
                recentMembers.map((member) => (
                  <tr key={member._id}>
                    <td>
                      {member.prenom} {member.nom}
                    </td>
                    <td>{member.email || 'Non renseigné'}</td>
                    <td>{member.telephone || 'Non renseigné'}</td>
                    <td>
                      {member.date_adhesion
                        ? new Date(member.date_adhesion).toLocaleDateString(
                            'fr-FR',
                          )
                        : 'Non renseignée'}
                    </td>
                    <td>
                      <span
                        className={`member-status member-status--${member.statut}`}
                      >
                        {member.statut}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="dashboard-empty">
                    Aucun membre enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel__heading">
          <h2>Accès rapides</h2>
        </div>
        <div className="quick-actions">
          {quickActions.map(([label, href, Icon, color]) => (
            <Link to={href} key={label}>
              <span className={`quick-actions__icon quick-actions__icon--${color}`}>
                <Icon size={21} />
              </span>
              <span>{label}</span>
              <Plus size={15} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
