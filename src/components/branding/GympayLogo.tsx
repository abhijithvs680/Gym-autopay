/** Blue “G” mark + optional Gympay wordmark. */

const markText = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-2xl",
} as const;

const markBox = {
  sm: "h-7 w-7 rounded-lg",
  md: "h-8 w-8 rounded-xl",
  lg: "h-14 w-14 rounded-2xl",
} as const;

const wordmarkText = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const;

interface GympayLogoProps {
  className?: string;
  size?: keyof typeof markBox;
  wordmark?: boolean;
}

export default function GympayLogo({ className = "", size = "md", wordmark = false }: GympayLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-blue-grad-start to-blue-grad-end font-extrabold leading-none tracking-tight text-white shadow-glow-blue ${markText[size]} ${markBox[size]}`}
        aria-hidden
      >
        G
      </div>
      {wordmark && (
        <span className={`font-extrabold leading-none tracking-tight ${wordmarkText[size]}`}>
          <span className="text-ink">Gym</span>
          <span className="text-primary">pay</span>
        </span>
      )}
    </div>
  );
}
