import { notFound } from 'next/navigation'
// import DesignConfigurator from './DesignConfigurator'
import { prisma } from '@/lib/prisma'

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

const Page = async ({ searchParams }: PageProps) => {
  const { id } = searchParams

  if (!id || typeof id !== 'string') {
    return notFound()
  }

  const configuration = await prisma.configuration.findUnique({
    where: { id },
  })

  if (!configuration) {
    return notFound()
  }

  const { imageUrl, width, height } = configuration

  return null
  // <DesignConfigurator
  //   configId={configuration.id}
  //   imageDimensions={{ width, height }}
  //   imageUrl={imageUrl}
  // />
}

export default Page
