import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import DesignPreview from '@/components/DesignPreview'
import { currentUser } from '@/lib/auth'

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

const Page = async ({ searchParams }: PageProps) => {
  const user = await currentUser()
  const { id } = searchParams

  if (!id || typeof id !== 'string') {
    return notFound()
  }

  const configuration = await prisma.configuration.findUnique({
    where: { id },
    include: { imageUrl: true, croppedImageUrl: true },
  })

  if (!configuration) {
    return notFound()
  }

  return <DesignPreview configuration={configuration} user={user} />
}

export default Page
