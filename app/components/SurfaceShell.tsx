type SurfaceShellProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hero";
};

export default function SurfaceShell({
  children,
  className,
  variant = "default",
}: SurfaceShellProps) {
  const spacingClass =
    variant === "hero" ? "pt-[clamp(8px,1.5vh,18px)]" : "pt-0";
  return (
    <div
      className={`surface relative z-0 min-h-screen bg-transparent text-white${
        className ? ` ${className}` : ""
      }`}
    >
      <div className={`relative ${spacingClass}`}>{children}</div>
    </div>
  );
}
