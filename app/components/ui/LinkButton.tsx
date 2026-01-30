import Link, { type LinkProps } from "next/link";
import { linkReset } from "../../lib/ui";
import { PremiumButton } from "../PremiumButton";

type LinkButtonVariant = "primary" | "ghost" | "outline";
type LinkButtonSize = "sm" | "md";

type LinkButtonProps = LinkProps & {
  className?: string;
  children: React.ReactNode;
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
};

const sizeMap: Record<LinkButtonSize, "sm" | "md"> = {
  sm: "sm",
  md: "md",
};

const variantMap: Record<LinkButtonVariant, "neutral" | "indigo"> = {
  primary: "indigo",
  ghost: "neutral",
  outline: "neutral",
};

export default function LinkButton({
  variant = "ghost",
  size = "md",
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={linkReset} {...props}>
      <PremiumButton type="button" size={sizeMap[size]} variant={variantMap[variant]} className={className}>
        {children}
      </PremiumButton>
    </Link>
  );
}
