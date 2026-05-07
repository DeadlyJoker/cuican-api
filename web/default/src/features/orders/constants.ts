export const ORDER_TYPE_OPTIONS = [
  { value: 'all', labelKey: 'All Types' },
  { value: 'topup', labelKey: 'TopUp' },
  { value: 'subscription', labelKey: 'Subscription' },
] as const

export const ORDER_STATUS_OPTIONS = [
  { value: 'all', labelKey: 'All Status' },
  { value: 'success', labelKey: 'Success' },
  { value: 'pending', labelKey: 'Pending' },
  { value: 'expired', labelKey: 'Expired' },
] as const

export const PAYMENT_METHOD_OPTIONS = [
  { value: '', labelKey: 'All Methods' },
  { value: 'stripe', labelKey: 'Stripe' },
  { value: 'alipay', labelKey: 'Alipay' },
  { value: 'wxpay', labelKey: 'WeChat Pay' },
  { value: 'creem', labelKey: 'Creem' },
  { value: 'waffo', labelKey: 'Waffo' },
] as const

export const ORDER_STATUS_CONFIG: Record<
  string,
  { variant: 'default' | 'secondary' | 'destructive' | 'outline'; labelKey: string }
> = {
  success: { variant: 'default', labelKey: 'Success' },
  pending: { variant: 'secondary', labelKey: 'Pending' },
  expired: { variant: 'destructive', labelKey: 'Expired' },
  failed: { variant: 'destructive', labelKey: 'Failed' },
}

export const ORDER_TYPE_CONFIG: Record<string, { labelKey: string }> = {
  topup: { labelKey: 'TopUp' },
  subscription: { labelKey: 'Subscription' },
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  stripe: 'Stripe',
  alipay: 'Alipay',
  wxpay: 'WeChat Pay',
  creem: 'Creem',
  waffo: 'Waffo',
  waffo_pancake: 'Waffo Pancake',
}
