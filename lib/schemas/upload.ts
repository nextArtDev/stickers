import { z } from 'zod'

export const uploadSchema = z.object({
  image: z.any(),
})
