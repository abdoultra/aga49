import './Logo.css'

interface LogoProps {
  light?: boolean
}

function Logo({ light = false }: LogoProps) {
  return (
    <div className={`logo ${light ? 'logo--light' : ''}`}>
      <span className="logo__mark" aria-hidden="true">
        <span>A</span>
        <span>G</span>
        <span>A</span>
      </span>
      <span className="logo__copy">
        <strong>Association</strong>
        <span>Guinéens d&apos;Angers</span>
      </span>
    </div>
  )
}

export default Logo
