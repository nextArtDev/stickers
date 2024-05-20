'use server'

import { auth } from '@/auth'
import { prisma } from '../prisma'
import { uploadFileToS3 } from './s3Upload'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { updateUploadSchema, uploadSchema } from '../schemas/upload'
import { Configuration, Uploader } from '@prisma/client'
import sharp from 'sharp'

interface CreateUploadFormState {
  // success?: string
  errors: {
    image?: string[]
    _form?: string[]
  }
}

export async function createUpload(
  formData: FormData,
  path: string
): Promise<CreateUploadFormState> {
  const result = uploadSchema.safeParse({
    image: formData.get('image'),
  })

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  // console.log(result?.data.image)

  //   const session = await auth()
  //   if (!session || !session.user || session.user.role !== 'ADMIN') {
  //     return {
  //       errors: {
  //         _form: ['شما اجازه دسترسی ندارید!'],
  //       },
  //     }
  //   }

  let configure: Configuration
  try {
    let imageId: string = ''
    const file = result.data.image as File

    const buffer = Buffer.from(await file.arrayBuffer())
    // console.log({ buffer })
    const imgMetaData = await sharp(buffer).metadata()

    const { width, height } = imgMetaData
    // console.log({ width })
    // console.log(imgMetaData.size)
    const convertedBuffer = await sharp(buffer).webp({ effort: 6 }).toBuffer()
    // const imgMetaDataConverted = await sharp(convertedBuffer).metadata()
    const res = await uploadFileToS3(convertedBuffer, file.name)

    // console.log({ convertedBuffer })
    // console.log(imgMetaDataConverted.width)
    // console.log(imgMetaDataConverted.size)
    if (res?.imageId && typeof res.imageId === 'string') {
      imageId = res.imageId
      // Use the imageId as needed
    }

    configure = await prisma.configuration.create({
      data: {
        height: height ? height : 500,
        width: width ? width : 500,
        imageUrl: {
          connect: { id: imageId },
        },
      },
    })
    // console.log(res?.imageUrl)
    // console.log(uploader)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }

  revalidatePath(path)
  redirect(`/configure/design?id=${configure.id}`)
}

interface UpdateUploadFormState {
  // success?: string
  errors: {
    image?: string[]
    id?: string[]
    _form?: string[]
  }
}

export async function updateUpload(
  formData: FormData,
  path: string
): Promise<UpdateUploadFormState> {
  const result = updateUploadSchema.safeParse({
    image: formData.get('image'),
    id: formData.get('id'),
  })

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  // console.log(result?.data.image)

  //   const session = await auth()
  //   if (!session || !session.user || session.user.role !== 'ADMIN') {
  //     return {
  //       errors: {
  //         _form: ['شما اجازه دسترسی ندارید!'],
  //       },
  //     }
  //   }

  let configure: Configuration
  try {
    let imageId: string = ''
    const file = result.data.image as File

    const buffer = Buffer.from(await file.arrayBuffer())
    // console.log({ buffer })
    const imgMetaData = await sharp(buffer).metadata()

    const { width, height } = imgMetaData
    // console.log({ width })
    // console.log(imgMetaData.size)
    // const convertedBuffer = await sharp(buffer).webp({ effort: 6 }).toBuffer()
    // const imgMetaDataConverted = await sharp(convertedBuffer).metadata()
    const res = await uploadFileToS3(buffer, file.name)

    // console.log({ convertedBuffer })
    // console.log(imgMetaDataConverted.width)
    // console.log(imgMetaDataConverted.size)
    if (res?.imageId && typeof res.imageId === 'string') {
      imageId = res.imageId
      // Use the imageId as needed
    }

    configure = await prisma.configuration.update({
      where: { id: result.data.id },
      data: {
        height: height ? height : 500,
        width: width ? width : 500,
        croppedImageUrl: {
          connect: { id: imageId },
        },
      },
    })
    // console.log(res?.imageUrl)
    // console.log(uploader)
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }

  revalidatePath(path)
  redirect(`/configure/design?id=${configure.id}`)
}
