'use client'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CardWrapper } from '@/components/auth/card-wrapper'
import { Button, buttonVariants } from '@/components/ui/button'
import { FormError } from './form-error'
import { FormSuccess } from './form-success'
import { LoginSchema } from '@/lib/schemas/auth'
import { login } from '@/lib/actions/auth/login'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

export const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [activation, setActivation] = useState<boolean | undefined>(false)
  const [isPending, startTransition] = useTransition()
  const [showPassWord, setShowPassWord] = useState<boolean>(false)

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  })

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError('')
    setSuccess('')

    startTransition(() => {
      login(values, callbackUrl)
        .then((data) => {
          if (
            data?.error ===
            'شما اکانت خود را از طریق کد ارسال شده فعال نکرده‌اید.'
          ) {
            setActivation(true)
            console.log(activation)
            setError(data.error)
          } else if (data?.error) {
            // form.reset()
            setError(data.error)
          }
          // form.reset()
          // router.push('/')

          // if (data?.success) {
          //   setSuccess(data.success)
          // }
          //     if (data?.twoFactor) {
          //       setShowTwoFactor(true)
          //     }
        })
        .catch(() => setError('مشکلی پیش آمده، لطفا دوباره امتحان کنید!'))
    })
  }

  return (
    <CardWrapper
      headerLabel="خوش آمدید"
      backButtonLabel="هنوز اکانت نساخته‌اید؟"
      backButtonHref="/register"
      showSocial
      className="rounded-sm border-nome "
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شماره موبایل</FormLabel>
                  <FormControl>
                    <Input
                      className="!bg-background/10 "
                      {...field}
                      disabled={isPending}
                      placeholder="09000000000"
                      type="string"
                    />
                  </FormControl>
                  <FormMessage className="" />
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
                        className="w-6 h-6 absolute top-[50%] -translate-y-[50%] left-1 sm:left-3 cursor-pointer"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="" />
                  <Button
                    size="sm"
                    variant="link"
                    asChild
                    className="px-0 font-normal"
                  >
                    <Link href="/reset">رمز عبور را فراموش کرده‌اید؟</Link>
                  </Button>
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          {activation ? (
            <Link
              className={cn(
                buttonVariants({ variant: 'destructive' }),
                'w-full'
              )}
              href={`/otp/${form.getValues('phone')}/reactive`}
            >
              فعالسازی اکانت
            </Link>
          ) : (
            <Button disabled={isPending} type="submit" className="w-full">
              {showTwoFactor ? 'تایید' : 'ورود'}
            </Button>
          )}
        </form>
      </Form>
    </CardWrapper>
  )
}
