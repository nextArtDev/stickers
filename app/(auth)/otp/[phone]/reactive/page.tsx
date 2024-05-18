'use client'

import React, {
  startTransition,
  useEffect,
  useState,
  useTransition,
} from 'react'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'

import { redirect, useParams, useRouter } from 'next/navigation'
import { FormError } from '@/components/auth/form-error'
import { FormSuccess } from '@/components/auth/form-success'

import OtpInput from '../../../../../components/auth/otp-input'
import { Button } from '@/components/ui/button'
import { activation } from '@/lib/actions/auth/register'
import { reactivate } from '@/lib/actions/auth/reactivate'
import { toast } from 'sonner'

type FormData = {
  otp: string
}

export default function OtpForm({ params }: { params: { phone: string } }) {
  const router = useRouter()
  // console.log(params.phone)
  const [sentSms, setSentSms] = useState(false)
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isPending, startTransition] = useTransition()
  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      otp: '',
    },
  })
  // useEffect(() => {
  //   const sendReactiveSms = async () => {
  //     const Sms = await sendSms({ phone: params.phone })
  //     console.log(Sms)
  //   }
  //   sendReactiveSms()
  // }, [params.phone])

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setError('')
    setSuccess('')

    // setError(res?.error)
    // setSuccess(res?.success)
    startTransition(() => {
      activation({ phone: params.phone, verificationCode: data.otp }).then(
        (res) => {
          setError(res.error)
          setSuccess(res.success)
          if (res.success) {
            toast('اکانت شما با موفقیت فعال شد، وارد حساب کاربری خود شوید!')
            router.push('/login')
          }
          if (res.error) {
            reset()
          }
        }
      )
    })

    // console.log(data) // Handle form submission
    // const res = await activation({ id: userID, verificationCode: data.otp })
    // console.log(res)
  }
  const smsSend = async () => {
    setError('')
    setSuccess('')

    // setError(res?.error)
    // setSuccess(res?.success)
    startTransition(() => {
      reactivate({ phone: params.phone })
        .then((res) => {
          setError(res.error)
          setSuccess(res.success)
          if (res.error === 'حساب شما فعال است!') {
            router.push('/')
          }
          if (res.success) {
            setSentSms(true)
          }
        })
        .catch(() => {})
    })

    // console.log(data) // Handle form submission
    // const res = await activation({ id: userID, verificationCode: data.otp })
    // console.log(res)
  }

  // Function to trigger form submission programmatically
  const handleComplete = () => {
    handleSubmit(onSubmit)() // Invoke the submit handler
  }

  return (
    <>
      {sentSms ? (
        <form dir="ltr" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, value } }) => (
              <OtpInput
                disabled={isPending}
                value={value}
                valueLength={6}
                onChange={onChange}
                onComplete={handleComplete} // Pass the handleComplete function
              />
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
        </form>
      ) : (
        <form
          className="w-full h-full flex flex-col items-center justify-center gap-6"
          onSubmit={handleSubmit(smsSend)}
        >
          <p className="text-xl font-semibold">ارسال کد تایید به شماره:</p>
          <Button variant={'destructive'} type="submit">
            {params.phone}
          </Button>
        </form>
      )}
    </>
  )
}
