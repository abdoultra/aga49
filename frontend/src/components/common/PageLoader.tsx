import './PageLoader.css'

interface PageLoaderProps {
  label?: string
}

function PageLoader({ label = 'Chargement de la page...' }: PageLoaderProps) {
  return (
    <main
      className="page-loader"
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <span aria-hidden="true" />
      {label}
    </main>
  )
}

export default PageLoader
