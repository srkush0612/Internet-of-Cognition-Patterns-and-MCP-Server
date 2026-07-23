export function ReferenceDesignChip() {
  return (
    <span className="reference-design-chip">
      <svg
        className="reference-design-chip__icon"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
      >
        <rect
          x="1"
          y="1"
          width="10"
          height="10"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path
          d="M4 6.5L5.5 8L8 4.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Reference design
    </span>
  );
}
