export interface UnifiedOrder {
  id: number
  type: 'topup' | 'subscription'
  user_id: number
  amount: number
  money: number
  trade_no: string
  payment_method: string
  payment_provider: string
  status: 'success' | 'pending' | 'expired' | 'failed'
  create_time: number
  complete_time: number
  plan_id?: number
}

export interface OrderFilter {
  keyword?: string
  type?: string
  status?: string
  payment_method?: string
  user_id?: number
  start_time?: number
  end_time?: number
}

export interface OrdersResponse {
  page: number
  page_size: number
  total: number
  items: UnifiedOrder[]
}

export interface MethodRevenue {
  method: string
  revenue: number
  count: number
}

export interface TypeRevenue {
  type: string
  revenue: number
  count: number
}

export interface RevenueTrendPoint {
  date: string
  revenue: number
  count: number
}

export interface OrderStatistics {
  total_revenue: number
  total_orders: number
  success_orders: number
  pending_orders: number
  success_rate: number
  average_order_value: number
  revenue_by_method: MethodRevenue[]
  revenue_by_type: TypeRevenue[]
  revenue_trend: RevenueTrendPoint[]
}
