'use server'

import * as z from 'zod'

import { sendSms, verifySms } from './sms'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { PhoneSchema } from '@/lib/schemas/auth'
import { getUserByPhoneNumber } from '@/lib/queries/auth/user'

// import { db } from "@/lib/db";
// import { getUserByEmail } from "@/data/user";
// import { sendVerificationEmail } from "@/lib/mail";
// import { generateVerificationToken } from "@/lib/tokens";

export const reactivate = async (values: z.infer<typeof PhoneSchema>) => {
  const validatedFields = PhoneSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' }
  }

  const { phone } = validatedFields.data

  const user = await getUserByPhoneNumber(phone)

  if (!user) {
    return { error: 'این شماره موجود نیست!' }
  }
  if (user.isVerified) return { error: 'حساب شما فعال است!' }

  const smsCode = await sendSms({ phone })

  if (smsCode?.error) {
    return { error: smsCode.error }
  }

  if (!smsCode?.verificationCode) {
    return { error: 'سرویس در دسترس نیست، لطفا بعدا دوباره امتحان کنید.' }
  }

  await prisma.user.update({
    where: { phone: user.phone },
    data: {
      verificationCode: smsCode.verificationCode,
      verificationDate: new Date(),
    },
  })
  // const verificationCode = await verifySms(phone, smsCode.verificationCode)

  // const verificationToken = await generateVerificationToken(email);
  // await sendVerificationEmail(
  //   verificationToken.email,
  //   verificationToken.token,
  // );

  return { success: 'کد تایید به شماره شما ارسال شد.', phone }
}
