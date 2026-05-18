import Link from "next/link";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "specflow";
  size?: "default" | "sm";
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function Button({
  variant = "primary",
  size = "default",
  href,
  onClick,
  children,
  className = "",
  type = "button",
  disabled,
  style,
}: ButtonProps) {
  const cls = `btn btn-${variant}${size === "sm" ? " btn-sm" : ""} ${className}`;
  if (href) {
    return <Link href={href} className={cls} style={style}>{children}</Link>;
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} style={style}>
      {children}
    </button>
  );
}
