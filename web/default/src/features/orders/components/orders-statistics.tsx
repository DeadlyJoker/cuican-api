import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { VChart } from '@visactor/react-vchart'
import { DollarSign, ShoppingCart, TrendingUp, Percent } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { VCHART_OPTION } from '@/lib/vchart'
import { useTheme } from '@/context/theme-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getOrderStatistics } from '../api'
import type { OrderStatistics as OrderStatsType } from '../types'

let themeManagerPromise: Promise<
  (typeof import('@visactor/vchart'))['ThemeManager']
> | null = null

export function OrdersStatistics() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const search = useSearch({ from: '/_authenticated/orders/' })
  const [themeReady, setThemeReady] = useState(false)
  const themeManagerRef = useRef<
    (typeof import('@visactor/vchart'))['ThemeManager'] | null
  >(null)

  useEffect(() => {
    const updateTheme = async () => {
      setThemeReady(false)
      if (!themeManagerPromise) {
        themeManagerPromise = import('@visactor/vchart').then(
          (m) => m.ThemeManager
        )
      }
      const ThemeManager = await themeManagerPromise
      themeManagerRef.current = ThemeManager
      ThemeManager.setCurrentTheme(resolvedTheme === 'dark' ? 'dark' : 'light')
      setThemeReady(true)
    }
    updateTheme()
  }, [resolvedTheme])

  const filter = useMemo(() => {
    const f: Record<string, unknown> = {}
    const type = search.type === 'all' ? '' : (search.type || '')
    if (type) f.type = type
    const status = search.status === 'all' ? '' : (search.status || '')
    if (status) f.status = status
    if (search.paymentMethod) f.payment_method = search.paymentMethod
    if (search.startTime) f.start_time = search.startTime
    if (search.endTime) f.end_time = search.endTime
    return f
  }, [search])

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-orders-statistics', filter],
    queryFn: async () => {
      const result = await getOrderStatistics(filter)
      return result.data as OrderStatsType
    },
  })

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-[120px]' />
          ))}
        </div>
        <Skeleton className='h-[300px]' />
      </div>
    )
  }

  if (!stats) return null

  const trendSpec = {
    type: 'area',
    data: [{ values: stats.revenue_trend || [] }],
    xField: 'date',
    yField: 'revenue',
    point: { visible: true, size: 4 },
    line: { style: { curveType: 'monotone' } },
    area: { style: { fillOpacity: 0.15 } },
    axes: [
      { orient: 'bottom', label: { autoRotate: true } },
      { orient: 'left', label: { formatter: (v: number) => `$${v.toFixed(0)}` } },
    ],
    tooltip: {
      mark: {
        content: [
          { key: t('Date'), value: (datum: Record<string, unknown>) => String(datum.date ?? '') },
          { key: t('Revenue'), value: (datum: Record<string, unknown>) => `$${(datum.revenue as number).toFixed(2)}` },
          { key: t('Orders'), value: (datum: Record<string, unknown>) => String(datum.count ?? '') },
        ],
      },
    },
  }

  const pieMethodSpec = {
    type: 'pie',
    data: [{ values: stats.revenue_by_method || [] }],
    valueField: 'revenue',
    categoryField: 'method',
    outerRadius: 0.8,
    innerRadius: 0.5,
    label: { visible: true, position: 'outside' },
    tooltip: {
      mark: {
        content: [
          { key: t('Method'), value: (datum: Record<string, unknown>) => String(datum.method ?? '') },
          { key: t('Revenue'), value: (datum: Record<string, unknown>) => `$${(datum.revenue as number).toFixed(2)}` },
          { key: t('Count'), value: (datum: Record<string, unknown>) => String(datum.count ?? '') },
        ],
      },
    },
  }

  const pieTypeSpec = {
    type: 'pie',
    data: [{ values: stats.revenue_by_type || [] }],
    valueField: 'revenue',
    categoryField: 'type',
    outerRadius: 0.8,
    innerRadius: 0.5,
    label: { visible: true, position: 'outside' },
    tooltip: {
      mark: {
        content: [
          { key: t('Type'), value: (datum: Record<string, unknown>) => String(datum.type ?? '') },
          { key: t('Revenue'), value: (datum: Record<string, unknown>) => `$${(datum.revenue as number).toFixed(2)}` },
          { key: t('Count'), value: (datum: Record<string, unknown>) => String(datum.count ?? '') },
        ],
      },
    },
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-4'>
        <StatCard
          title={t('Total Revenue')}
          value={`$${stats.total_revenue.toFixed(2)}`}
          icon={<DollarSign className='h-4 w-4 text-muted-foreground' />}
        />
        <StatCard
          title={t('Total Orders')}
          value={String(stats.total_orders)}
          icon={<ShoppingCart className='h-4 w-4 text-muted-foreground' />}
          description={`${stats.pending_orders} ${t('pending')}`}
        />
        <StatCard
          title={t('Success Rate')}
          value={`${stats.success_rate.toFixed(1)}%`}
          icon={<Percent className='h-4 w-4 text-muted-foreground' />}
        />
        <StatCard
          title={t('Average Order Value')}
          value={`$${stats.average_order_value.toFixed(2)}`}
          icon={<TrendingUp className='h-4 w-4 text-muted-foreground' />}
        />
      </div>

      {themeReady && stats.revenue_trend && stats.revenue_trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>{t('Revenue Trend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <VChart spec={trendSpec} {...VCHART_OPTION} style={{ height: '300px' }} />
          </CardContent>
        </Card>
      )}

      <div className='grid gap-4 md:grid-cols-2'>
        {themeReady && stats.revenue_by_method && stats.revenue_by_method.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>{t('Revenue by Payment Method')}</CardTitle>
            </CardHeader>
            <CardContent>
              <VChart spec={pieMethodSpec} {...VCHART_OPTION} style={{ height: '280px' }} />
            </CardContent>
          </Card>
        )}

        {themeReady && stats.revenue_by_type && stats.revenue_by_type.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>{t('Revenue by Order Type')}</CardTitle>
            </CardHeader>
            <CardContent>
              <VChart spec={pieTypeSpec} {...VCHART_OPTION} style={{ height: '280px' }} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string
  value: string
  icon: React.ReactNode
  description?: string
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {description && (
          <p className='text-xs text-muted-foreground'>{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
