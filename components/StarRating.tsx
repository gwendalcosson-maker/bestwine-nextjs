interface StarRatingProps {
  count: number
  className?: string
}

export default function StarRating({ count, className = '' }: StarRatingProps) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <svg
          key={i}
          role="img"
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-gold"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}
