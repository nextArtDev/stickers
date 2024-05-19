'use client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
// import useMount from '@/hooks/useMount'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { ChangeEvent, startTransition, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Loader2, PictureInPicture } from 'lucide-react'
import Image from 'next/image'

import { Input } from '@/components/ui/input'
import { uploadSchema } from '@/lib/schemas/upload'
import { createUpload } from '@/lib/actions/upload'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

function ProfileAvatar() {
  const path = usePathname()
  const [imgFile, setImgFile] = useState<File | undefined>(undefined)
  const [displayUrl, setDisplayUrl] = useState('')

  function getImageData(event: ChangeEvent<HTMLInputElement>) {
    // FileList is immutable, so we need to create a new one
    const dataTransfer = new DataTransfer()

    // Add newly uploaded images
    Array.from(event.target.files!).forEach((image) =>
      dataTransfer.items.add(image)
    )

    const files = dataTransfer.files
    const displayUrl = URL.createObjectURL(event.target.files![0])
    setDisplayUrl(displayUrl)

    return { files, displayUrl }
  }

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      image: undefined,
      // name: user.name || '',
      // username: user.username || '',
    },
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  //   const mount = useMount()

  //   if (!mount) return null

  // @ts-ignore
  // return <UserAvatar user={user}  className="w-20 h-20 md:w-36 md:h-36" />
  // If its not our profile

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          const formData = new FormData()

          if (imgFile) {
            // await uploadUserImageToS3(imgFile, user.id)
            formData.append('image', imgFile)
          }

          try {
            startTransition(() => {
              createUpload(formData, path)
                .then((res) => {
                  if (res?.errors.image) {
                    form.setError('image', {
                      type: 'custom',
                      message: res?.errors.image?.join(' و '),
                    })
                  } else if (res?.errors?._form) {
                    console.log(res?.errors?._form?.join(' و '))
                    toast.error(res?.errors?._form?.join(' و '))
                  }
                })
                .catch(() => toast.error('مشکلی پیش آمده.'))
            })
          } catch (error) {
            console.log(error)
            return toast.error('مشکلی پیش آمده')
          }
          setOpen(false)
          form.reset()
          // window.location.reload()
        })}
      >
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...rest } }) => (
            <>
              <FormItem className="my-8 flex flex-col items-center justify-center ">
                <FormLabel>
                  {!displayUrl ? (
                    <div className="border px-16 py-4 rounded-xl flex flex-col gap-8 justify-center items-center cursor-pointer ">
                      <PictureInPicture size={50} />
                      <p>آپلود عکس</p>
                    </div>
                  ) : (
                    <Image
                      width={160}
                      height={160}
                      src={displayUrl}
                      className="aspect-square object-cover rounded-full"
                      alt="temporary"
                    />
                  )}
                </FormLabel>
                <FormControl>
                  <input
                    // multiple={''}
                    className=" hidden "
                    type="file"
                    {...rest}
                    onChange={(event) => {
                      const { files, displayUrl } = getImageData(event)
                      // console.log(files[0])
                      onChange(files)
                      setImgFile(files[0])
                    }}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            </>
          )}
        />

        {/* {user.image && ( */}
        <div className="py-8 max-w-sm mx-auto">
          <Button
            type="submit"
            className="border-b border-zinc-300 dark:border-neutral-300 font-bold disabled:cursor-not-allowed w-full p-3"
            onClick={() => {
              form.setValue('image', '')
              if (inputRef.current) {
                inputRef.current.click()
              }
            }}
            disabled={form.formState.isSubmitting}
          >
            تایید
          </Button>
        </div>
        {/* )} */}

        <input hidden ref={inputRef} />
      </form>
    </Form>
  )
}

export default ProfileAvatar
