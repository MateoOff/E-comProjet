export const Button = ({
  className = "",
  size = "default",
  variant = "default",
  children,
  ...props
}) => {
  const baseClasses =
    "relative group overflow-hidden rounded-full font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    default:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/25",
    outline:
      "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
    primary:
      "bg-blue-600 text-primary-foreground hover:bg-blue-600/75 shadow-lg shadow-primary/25",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-7 py-4 text-lg",
  };

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.default,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      <span className="relative flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};
