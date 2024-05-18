'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Header } from './header'
import { BackButton } from './back-button'
import { cn } from '@/lib/utils'
// import { Header } from "@/components/auth/header";
// import { Social } from "@/components/auth/social";
// import { BackButton } from "@/components/auth/back-button";

interface CardWrapperProps {
  children: React.ReactNode
  headerLabel: string
  backButtonLabel: string
  backButtonHref: string
  showSocial?: boolean
  className?: string
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
  className,
}: CardWrapperProps) => {
  return (
    <Card className="max-w-[400px] w-[98%] mx-auto shadow-2xl bg-blur-sm border-none  rounded-2xl bg-opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-300/5 via-yellow-100/5 to-orange-900/5 dark:from-orange-800/5 dark:via-yellow-700/5 dark:to-orange-900/5">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent className={cn(className)}>{children}</CardContent>
      {/* {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )} */}
      <CardFooter>
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </CardFooter>
    </Card>
  )
}
