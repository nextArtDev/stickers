'use server'

import { auth } from '@/auth'
import { prisma } from '../prisma'
import { uploadFileToS3 } from './s3Upload'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { updateUploadSchema, uploadSchema } from '../schemas/upload'
import {
  CaseColor,
  CaseFinish,
  CaseMaterial,
  Configuration,
  Order,
  PhoneModel,
  Uploader,
} from '@prisma/client'
import sharp from 'sharp'

import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products'
import { currentUser } from '../auth'

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
    color: formData.get('color'),
    model: formData.get('model'),
    material: formData.get('material'),
    finish: formData.get('finish'),
    id: formData.get('configId'),
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
        // height: height ? height : 500,
        // width: width ? width : 500,
        croppedImageUrl: {
          connect: { id: imageId },
        },
        color: result.data.color as CaseColor,
        finish: result.data.finish as CaseFinish,
        model: result.data.model as PhoneModel,
        material: result.data.material as CaseMaterial,
      },
    })
    // console.log(res?.imageUrl)
    // console.log(configure)
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
  // /configure/preview?id=${configId}
  redirect(`/configure/preview?id=${configure.id}`)
}

/////////////////////////

export const createCheckoutSession = async ({
  configId,
}: {
  configId: string
}) => {
  const configuration = await prisma.configuration.findUnique({
    where: { id: configId },
  })

  if (!configuration) {
    throw new Error('No such configuration found')
  }

  const user = await currentUser()
  if (!user?.id) {
    throw new Error('You need to be logged in')
  }
  // console.log(user.id)
  const { finish, material } = configuration

  let price = BASE_PRICE
  if (finish === 'textured') price += PRODUCT_PRICES.finish.textured
  if (material === 'polycarbonate')
    price += PRODUCT_PRICES.material.polycarbonate

  let order: Order | undefined = undefined

  try {
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        configurationId: configuration.id,
      },
    })

    if (existingOrder) {
      order = existingOrder
      console.log(order)
    } else {
      order = await prisma.order.create({
        data: {
          amount: Number(price) / 100,
          // userId: user.id,
          // configurationId: configuration.id,
          user: {
            connect: { id: user.id },
          },
          configuration: {
            connect: { id: configuration.id },
          },
        },
      })
    }
  } catch (error) {
    // console.log(error)
  }
  // console.log(order)
  // const product = await stripe.products.create({
  //   name: 'Custom iPhone Case',
  //   images: [configuration.imageUrl],
  //   default_price_data: {
  //     currency: 'USD',
  //     unit_amount: price,
  //   },
  // })

  // const stripeSession = await stripe.checkout.sessions.create({
  //   success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
  //   payment_method_types: ['card', 'paypal'],
  //   mode: 'payment',
  //   shipping_address_collection: { allowed_countries: ['DE', 'US'] },
  //   metadata: {
  //     userId: user.id,
  //     orderId: order.id,
  //   },
  //   line_items: [{ price: product.default_price as string, quantity: 1 }],
  // })

  return { orderId: order?.id }
}
