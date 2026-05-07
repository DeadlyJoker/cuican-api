import { type Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ORDER_TYPE_OPTIONS, ORDER_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS } from '../constants'
import type { UnifiedOrder } from '../types'

interface OrdersToolbarProps {
  table: Table<UnifiedOrder>
}

export function OrdersToolbar({ table }: OrdersToolbarProps) {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_authenticated/orders/' })
  const navigate = useNavigate()

  const updateSearch = (updates: Record<string, unknown>) => {
    navigate({
      to: '/orders',
      search: { ...search, ...updates, page: 1 },
    })
  }

  return (
    <div className='flex flex-wrap items-center gap-2 py-2'>
      <div className='relative flex-1 min-w-[200px] max-w-sm'>
        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder={t('Search by trade number...')}
          value={table.getState().globalFilter ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className='pl-8'
        />
      </div>

      <Select
        value={search.type || 'all'}
        onValueChange={(value) => updateSearch({ type: value })}
      >
        <SelectTrigger className='w-[140px]'>
          <SelectValue placeholder={t('All Types')} />
        </SelectTrigger>
        <SelectContent>
          {ORDER_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={search.status || 'all'}
        onValueChange={(value) => updateSearch({ status: value })}
      >
        <SelectTrigger className='w-[140px]'>
          <SelectValue placeholder={t('All Status')} />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={search.paymentMethod || ''}
        onValueChange={(value) => updateSearch({ paymentMethod: value })}
      >
        <SelectTrigger className='w-[150px]'>
          <SelectValue placeholder={t('All Methods')} />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_METHOD_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
