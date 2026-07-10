/** Decorative brand accents (purely visual). */

export function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="currentColor">
      <path d="M50 2c4 38 6 44 48 48-42 4-44 10-48 48-4-38-6-44-48-48 42-4 44-10 48-48Z" />
    </svg>
  );
}

export function DotGrid({ className }: { className?: string }) {
  return (
    <svg className={className} width="132" height="132" aria-hidden="true">
      <defs>
        <pattern id="arva-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1.6" cy="1.6" r="1.6" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="132" height="132" fill="url(#arva-dots)" />
    </svg>
  );
}
