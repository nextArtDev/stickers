'use server'

import * as z from 'zod'
import { AuthError } from 'next-auth'

import { signIn } from '@/auth'

import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

import { sendSms, verifySms } from './sms'
import { LoginSchema } from '@/lib/schemas/auth'
import { getUserByPhoneNumber } from '@/lib/queries/auth/user'
import { redirect } from 'next/navigation'

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null
) => {
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'ورودی معتبر نیست!' }
  }
  // return { success: 'Email sent!' }
  const { phone, password } = validatedFields.data

  const existingUser = await getUserByPhoneNumber(phone)
  if (!existingUser || !existingUser.phone || !existingUser.password) {
    return { error: 'کاربر با این شماره موجود نیست!' }
  }

  if (!existingUser.isVerified) {
    return { error: 'شما اکانت خود را از طریق کد ارسال شده فعال نکرده‌اید.' }
    //   const smsCode = await sendSms({ phone: existingUser.phone })

    //   if (!smsCode?.error && smsCode?.verificationCode) {

    //     const smsVerification = await verifySms({
    //       id: existingUser.id,
    //       verificationCode: JSON.stringify(smsCode.verificationCode),
    //     })
    //   }
  }

  try {
    await signIn('credentials', {
      phone,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'مشخصات نامعتبر است!' }
        default:
          return { error: 'مشکلی پیش آمده، لطفا دوباره امتحان کنید!' }
      }
    }

    throw error
  }
}
