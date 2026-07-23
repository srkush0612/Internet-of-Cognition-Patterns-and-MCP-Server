export function LockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <rect
        x="3.5"
        y="7"
        width="9"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M5.5 7V5.25a2.5 2.5 0 0 1 5 0V7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PresenceIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
    >
      <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="9" cy="9" r="2" fill="currentColor" />
      <path
        d="M9 2.75V4.5M9 13.5V15.25M2.75 9H4.5M13.5 9H15.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
    >
      <path
        d="M9 2.5l1.55 3.14 3.47.5-2.51 2.45.59 3.45L9 10.68 5.9 12.04l.59-3.45L4 6.14l3.47-.5L9 2.5z"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EyeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <path
        d="M1.25 7s2.25-4.25 5.75-4.25S12.75 7 12.75 7s-2.25 4.25-5.75 4.25S1.25 7 1.25 7z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <circle cx="7" cy="7" r="1.75" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function LightningIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <path
        d="M7.75 1.25 4.25 7.5h3.25L6.25 12.75 9.75 6.5H6.5L7.75 1.25z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PauseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <rect x="3.5" y="2.75" width="2.5" height="8.5" rx="0.75" fill="currentColor" />
      <rect x="8" y="2.75" width="2.5" height="8.5" rx="0.75" fill="currentColor" />
    </svg>
  );
}

export function FilterIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <path
        d="M1.75 2.75h10.5M3.75 7h6.5M5.75 11.25h2.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WidenIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 2.75v8.5M4.25 5.5 7 2.75 9.75 5.5M4.25 8.5 7 11.25 9.75 8.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ActivityOrb({
  size = 40,
  pulse = false,
}: {
  size?: number;
  pulse?: boolean;
}) {
  return (
    <span
      className={`presence-orb${pulse ? " presence-orb--pulse" : ""}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <circle cx="20" cy="20" r="8" fill="currentColor" />
      </svg>
    </span>
  );
}
