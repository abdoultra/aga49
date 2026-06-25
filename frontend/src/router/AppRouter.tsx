import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import PageLoader from '../components/common/PageLoader'
import AdminLayout from '../layouts/AdminLayout'
import PublicLayout from '../layouts/PublicLayout'

const AdminPlaceholderPage = lazy(() => import('../pages/admin/AdminPlaceholderPage'))
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'))
const DocumentsPage = lazy(() => import('../pages/admin/DocumentsPage'))
const GalleryPage = lazy(() => import('../pages/admin/GalleryPage'))
const LoginPage = lazy(() => import('../pages/admin/LoginPage'))
const MembershipFeesPage = lazy(() => import('../pages/admin/MembershipFeesPage'))
const MembersPage = lazy(() => import('../pages/admin/MembersPage'))
const MessagesPage = lazy(() => import('../pages/admin/MessagesPage'))
const PublicationsPage = lazy(() => import('../pages/admin/PublicationsPage'))
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage'))
const SetupAdminPage = lazy(() => import('../pages/admin/SetupAdminPage'))
const AlbumPage = lazy(() => import('../pages/public/AlbumPage'))
const DocumentsPagePublic = lazy(() => import('../pages/public/DocumentsPage'))
const GalleryPagePublic = lazy(() => import('../pages/public/GalleryPage'))
const HomePage = lazy(() => import('../pages/public/HomePage'))
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'))
const PublicationDetailPage = lazy(
  () => import('../pages/public/PublicationDetailPage'),
)
const PublicationsListPage = lazy(
  () => import('../pages/public/PublicationsListPage'),
)

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/galerie', element: <GalleryPagePublic /> },
      { path: '/galerie/:id', element: <AlbumPage /> },
      { path: '/documents', element: <DocumentsPagePublic /> },
      {
        path: '/actualites',
        element: <PublicationsListPage mode="content" />,
      },
      {
        path: '/evenements',
        element: <PublicationsListPage mode="events" />,
      },
      {
        path: '/publications/:id',
        element: <PublicationDetailPage />,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin/setup',
    element: <SetupAdminPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'membres', element: <MembersPage /> },
          { path: 'cotisations', element: <MembershipFeesPage /> },
          {
            path: 'actualites',
            element: <PublicationsPage mode="content" />,
          },
          {
            path: 'evenements',
            element: <PublicationsPage mode="events" />,
          },
          { path: 'galerie', element: <GalleryPage /> },
          { path: 'documents', element: <DocumentsPage /> },
          { path: 'messages', element: <MessagesPage /> },
          { path: 'parametres', element: <SettingsPage /> },
          { path: ':section', element: <AdminPlaceholderPage /> },
        ],
      },
    ],
  },
])

function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default AppRouter
