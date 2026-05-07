import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { ROLE } from '@/lib/roles'
import { Orders } from '@/features/orders'

const ordersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
  type: z.enum(['all', 'topup', 'subscription']).optional().catch('all'),
  status: z.enum(['all', 'success', 'pending', 'expired']).optional().catch('all'),
  paymentMethod: z.string().optional().catch(''),
  startTime: z.number().optional().catch(undefined),
  endTime: z.number().optional().catch(undefined),
  tab: z.enum(['list', 'statistics']).optional().catch('list'),
})

export const Route = createFileRoute('/_authenticated/orders/')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()

    if (!auth.user || auth.user.role < ROLE.ADMIN) {
      throw redirect({
        to: '/403',
      })
    }
  },
  validateSearch: ordersSearchSchema,
  component: Orders,
})
