'use client'

import * as z from 'zod'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CardWrapper } from '@/components/auth/card-wrapper'
import { Button } from '@/components/ui/button'
import { FormError } from './form-error'
import { FormSuccess } from './form-success'

import { useRouter } from 'next/navigation'
import { RegisterSchema } from '@/lib/schemas/auth'
import { register } from '@/lib/actions/auth/register'
import { Eye } from 'lucide-react'
import Link from 'next/link'

export const RegisterForm = () => {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isPending, startTransition] = useTransition()
  const [showPassWord, setShowPassWord] = useState<boolean>(false)
  const [activation, setActivation] = useState<boolean | undefined>(false)
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      phone: '',
      password: '',
      name: '',
    },
  })

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError('')
    setSuccess('')

    startTransition(() => {
      register(values)
        .then((data) => {
          if (
            data?.error ===
            'شما قبلا ثبت نام کرده‌اید، لطفا به قسمت فعالسازی اکانت بروید.'
          ) {
            setError(data.error)
            setActivation(true)
          }

          setError(data.error)
          setSuccess(data.success)
          if (data.success) {
            router.push(`/otp/${values.phone}`)
          }
        })
        .catch((error) => console.log(error))
    })
  }

  return (
    <CardWrapper
      headerLabel="ایجاد حساب"
      backButtonLabel="قبلا حساب ایجاد کرده‌اید؟"
      backButtonHref="/login"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام کاربری</FormLabel>
                  <FormControl>
                    <Input
                      className="!bg-background/10 "
                      {...field}
                      disabled={isPending}
                      placeholder="John Doe"
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    این نام در صفحه شما نمایش داده خواهد شد{' '}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>موبایل</FormLabel>
                  <FormControl>
                    <Input
                      className="!bg-background/10 "
                      {...field}
                      disabled={isPending}
                      placeholder="0900000000"
                    />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    کد تایید به این شماره ارسال خواهد شد.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز عبور</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="!bg-background/10"
                        {...field}
                        disabled={isPending}
                        placeholder="******"
                        type={showPassWord ? '' : 'password'}
                      />
                      <Eye
                        onClick={() => setShowPassWord((prev) => !prev)}
                        className=" w-6 h-6 absolute top-[50%] -translate-y-[50%] left-1 sm:left-3 cursor-pointer"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          {activation ? (
            <Button variant={'destructive'} className="w-full">
              <Link href={`/otp/${form.getValues('phone')}/reactive`}>
                فعالسازی اکانت
              </Link>
            </Button>
          ) : (
            <Button disabled={isPending} type="submit" className="w-full">
              ارسال کد تایید
            </Button>
          )}
        </form>
      </Form>
    </CardWrapper>
  )
}
