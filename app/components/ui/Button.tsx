import { PremiumButton } from "../PremiumButton";

type ButtonVariant = "primary" | "ghost" | "outline";
type ButtonSize = "sm" | "md";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const sizeMap: Record<ButtonSize, "sm" | "md"> = {
  sm: "sm",
  md: "md",
};

const variantMap: Record<ButtonVariant, "neutral" | "indigo"> = {
  primary: "indigo",
  ghost: "neutral",
  outline: "neutral",
};

export default function Button({
  variant = "ghost",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <PremiumButton
      {...props}
      size={sizeMap[size]}
      variant={variantMap[variant]}
      className={className}
    />
  );
}
