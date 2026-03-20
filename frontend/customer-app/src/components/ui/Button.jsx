export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-1"

  const variants = {
    primary:
      "bg-sky-600 text-white hover:bg-sky-500 focus:ring-sky-400",
    secondary:
      "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400",
    danger:
      "bg-red-600 text-white hover:bg-red-500 focus:ring-red-400",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400",
    ghost:
      "hover:bg-gray-100 text-gray-700 focus:ring-gray-400",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

