interface SectionHeadingProps {
  title: string
  linkLabel?: string
  href?: string
}

function SectionHeading({ title, linkLabel, href }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {linkLabel && (
        <a href={href}>
          {linkLabel}
          <span aria-hidden="true"> →</span>
        </a>
      )}
    </div>
  )
}

export default SectionHeading
