import { api } from '@/lib/api'
import type { OrderFilter, OrdersResponse, OrderStatistics } from './types'

export async function getOrders(params: {
  p: number
  page_size: number
  keyword?: string
  type?: string
  status?: string
  payment_method?: string
  user_id?: number
  start_time?: number
  end_time?: number
}) {
  const res = await api.get<{ success: boolean; data: OrdersResponse }>(
    '/api/admin/orders/',
    { params }
  )
  return res.data
}

export async function getOrderStatistics(filter: OrderFilter) {
  const res = await api.get<{ success: boolean; data: OrderStatistics }>(
    '/api/admin/orders/statistics',
    { params: filter }
  )
  return res.data
}

export async function exportOrders(filter: OrderFilter) {
  const res = await api.get('/api/admin/orders/export', {
    params: filter,
    responseType: 'blob',
  })
  return res.data
}
