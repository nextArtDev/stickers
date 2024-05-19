'use server'

import { auth } from '@/auth'
import { prisma } from '../prisma'
import { uploadFileToS3 } from './s3Upload'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { uploadSchema } from '../schemas/upload'
import { Uploader } from '@prisma/client'

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
  // const fileBuffer = result?.data.image
  //   const fileBuffer = await sharp(file)
  //     .jpeg({ quality: 50 })
  //     .resize(800, 400)
  //     .toBuffer()

  //   const session = await auth()
  //   if (!session || !session.user || session.user.role !== 'ADMIN') {
  //     return {
  //       errors: {
  //         _form: ['شما اجازه دسترسی ندارید!'],
  //       },
  //     }
  //   }

  let uploader: Uploader
  try {
    let imageId: string = ''
    const file = result.data.image as File

    const buffer = Buffer.from(await file.arrayBuffer())
    // console.log({ buffer })
    const res = await uploadFileToS3(buffer, file.name)
    // console.log(res)
    if (res?.imageId && typeof res.imageId === 'string') {
      imageId = res.imageId
      // Use the imageId as needed
    }

    uploader = await prisma.uploader.create({
      data: {
        images: {
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
  redirect(`/configure/design?id=${uploader.id}`)
}
