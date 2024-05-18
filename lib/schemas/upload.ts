import { z } from 'zod'

export const uploadSchema = z.object({
  images: z.any(),
})
