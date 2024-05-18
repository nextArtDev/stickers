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
    images?: string[]
    _form?: string[]
  }
}

export async function createUpload(
  formData: FormData,
  path: string
): Promise<CreateUploadFormState> {
  const result = uploadSchema.safeParse({
    images: formData.getAll('images'),
  })
  if (!result.success) {
    console.log(result.error.flatten().fieldErrors)
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }
  console.log(result?.data.images.length)

  //   const session = await auth()
  //   if (!session || !session.user || session.user.role !== 'ADMIN') {
  //     return {
  //       errors: {
  //         _form: ['شما اجازه دسترسی ندارید!'],
  //       },
  //     }
  //   }

  console.log(result)
  let uploader: Uploader
  try {
    let imageId: string = ''
    const file = result.data.images as File
    const buffer = Buffer.from(await file.arrayBuffer())
    const res = await uploadFileToS3(buffer, file.name)

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
    // console.log(category)
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
