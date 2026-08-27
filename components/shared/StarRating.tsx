"use client";

type Props = {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Interactive mode — clicking a star sets the rating */
  onChange?: (rating: number) => void;
  /** Hover preview label prefix for a11y */
  label?: string;
};

const sizePx = {
  sm: 16,
  md: 22,
  lg: 28,
};

const interactivePx = {
  sm: 28,
  md: 36,
  lg: 44,
};

function StarGlyph({
  filled,
  size,
}: {
  filled: boolean;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className="transition-transform duration-150"
    >
      <path
        d="M12 2.75l2.66 5.39 5.95.86-4.3 4.19 1.02 5.94L12 16.98l-5.33 2.8 1.02-5.94-4.3-4.19 5.95-.86L12 2.75z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StarRating({
  rating,
  size = "md",
  className = "",
  onChange,
  label = "Оцінка",
}: Props) {
  const value = Math.min(5, Math.max(0, rating));
  const px = onChange ? interactivePx[size] : sizePx[size];

  if (onChange) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 ${className}`}
        role="radiogroup"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= Math.round(value);
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === Math.round(value)}
              aria-label={`${n} з 5`}
              onClick={() => onChange(n)}
              className={`rounded-md p-0.5 transition-all duration-150 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B9A47] ${
                active ? "text-[#E0A800]" : "text-[#3D1A00]/22 hover:text-[#E0A800]/55"
              }`}
            >
              <StarGlyph filled={active} size={px} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 leading-none ${className}`}
      aria-label={`${value} з 5 зірок`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={
            n <= Math.round(value) ? "text-[#E0A800]" : "text-[#3D1A00]/20"
          }
        >
          <StarGlyph filled={n <= Math.round(value)} size={px} />
        </span>
      ))}
    </div>
  );
}
