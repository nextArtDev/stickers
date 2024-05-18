const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      dir="rtl"
      className="h-full flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-300 via-yellow-100 to-orange-900 dark:from-orange-800 dark:via-yellow-700 dark:to-orange-900 "
    >
      {children}
    </div>
  )
}

export default AuthLayout

// text: bg-clip-text bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-300 via-yellow-100 to-orange-900
