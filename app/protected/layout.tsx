import { Navbar } from './_components/navbar'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  return (
    <div className="h-full w-full flex flex-col gap-y-10 items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-300 via-yellow-100 to-orange-900 dark:from-orange-800 dark:via-yellow-700 dark:to-orange-900">
      <Navbar />
      {children}
    </div>
  )
}

export default ProtectedLayout
