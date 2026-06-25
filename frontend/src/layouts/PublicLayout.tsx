import { Outlet } from 'react-router-dom'
import PublicFooter from '../components/public/PublicFooter'
import PublicHeader from '../components/public/PublicHeader'

function PublicLayout() {
  return (
    <>
      <PublicHeader />
      <Outlet />
      <PublicFooter />
    </>
  )
}

export default PublicLayout
