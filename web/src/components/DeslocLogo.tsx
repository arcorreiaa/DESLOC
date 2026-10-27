type Props = {
  compact?: boolean
}

export function DeslocLogo({ compact = false }: Props) {
  return (
    <div className={`desloc-logo ${compact ? 'desloc-logo--compact' : ''}`} aria-label="DESLOC">
      <svg className="desloc-logo__mark" viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <linearGradient id="deslocGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a9d6c" />
            <stop offset="100%" stopColor="#5dffc8" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="12" fill="#0f1613" />
        <path
          d="M11 28V12h8.2c4.6 0 7.4 2.4 7.4 6.2 0 2.3-1.1 4.1-3 5.1l4.4 4.7H18l-3.2-3.6H15v3.6H11zm4-9.2h4c1.6 0 2.5-.8 2.5-2s-.9-2-2.5-2h-4v4z"
          fill="url(#deslocGrad)"
        />
      </svg>
      <div className="desloc-logo__text">
        <span className="desloc-logo__name">DESLOC</span>
        {!compact && <span className="desloc-logo__tag">Mobilidade inteligente</span>}
      </div>
    </div>
  )
}
