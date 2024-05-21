import { notFound } from 'next/navigation'
// import DesignConfigurator from './DesignConfigurator'
import { prisma } from '@/lib/prisma'
import DesignConfigurator from '@/components/DesignConfigurator'

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
    include: {
      imageUrl: { select: { url: true } },
    },
  })

  if (!configuration) {
    return notFound()
  }

  const { imageUrl, width, height } = configuration
  // console.log(imageUrl, width, height)
  // console.log(configuration.id)
  return (
    <DesignConfigurator
      configId={configuration.id}
      imageDimensions={{ width, height }}
      imageUrl={imageUrl.url}
    />
  )
}

export default Page
