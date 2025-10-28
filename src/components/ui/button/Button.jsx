const Button = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-1 text-base",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300",
    "update":
      "bg-white text-brand-600 border border-brand-600 hover:bg-brand-50",
    "delete":
      "bg-white text-red-600 border border-red-600 hover:bg-red-50",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;

