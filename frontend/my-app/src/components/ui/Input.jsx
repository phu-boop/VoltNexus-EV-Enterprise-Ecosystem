export default function Input({
                                  label,
                                  type = "text",
                                  placeholder = "",
                                  value,
                                  onChange,
                                  error,
                                  className = "",
                                  ...rest
                              }) {
    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && (
                <label className="text-sm font-medium text-slate-700">{label}</label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`px-4 py-2 border rounded-lg outline-none transition 
          focus:ring-2 focus:ring-sky-400 focus:border-sky-400 
          ${error ? "border-red-500" : "border-slate-300"} 
        `}
                {...rest}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}
