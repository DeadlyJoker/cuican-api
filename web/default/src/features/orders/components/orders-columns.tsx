import { type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { CopyButton } from '@/components/copy-button'
import { ORDER_STATUS_CONFIG, ORDER_TYPE_CONFIG, PAYMENT_METHOD_LABELS } from '../constants'
import type { UnifiedOrder } from '../types'
import { OrderRowActions } from './order-row-actions'

function formatTime(ts: number): string {
  if (!ts) return '-'
  return new Date(ts * 1000).toLocaleString()
}

function formatMoney(money: number): string {
  return `$${money.toFixed(2)}`
}

export function useOrdersColumns(): ColumnDef<UnifiedOrder>[] {
  const { t } = useTranslation()
  return [
    {
      accessorKey: 'type',
      meta: { label: t('Type') },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Type')} />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        const config = ORDER_TYPE_CONFIG[type]
        return (
          <Badge variant='outline'>
            {t(config?.labelKey || type)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'trade_no',
      meta: { label: t('Trade No') },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Trade No')} />
      ),
      cell: ({ row }) => {
        const tradeNo = row.getValue('trade_no') as string
        return (
          <div className='flex items-center gap-1'>
            <span className='font-mono text-xs max-w-[140px] truncate'>{tradeNo}</span>
            <CopyButton value={tradeNo} size='icon' className='h-6 w-6' iconClassName='h-3 w-3' />
          </div>
        )
      },
    },
    {
      accessorKey: 'user_id',
      meta: { label: t('User ID'), mobileHidden: true },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('User ID')} />
      ),
      cell: ({ row }) => (
        <Badge variant='secondary'>{row.getValue('user_id')}</Badge>
      ),
    },
    {
      accessorKey: 'money',
      meta: { label: t('Money') },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Money')} />
      ),
      cell: ({ row }) => (
        <span className='font-medium text-red-600'>
          {formatMoney(row.getValue('money') as number)}
        </span>
      ),
    },
    {
      accessorKey: 'payment_method',
      meta: { label: t('Payment Method'), mobileHidden: true },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Payment Method')} />
      ),
      cell: ({ row }) => {
        const method = row.getValue('payment_method') as string
        return <span>{PAYMENT_METHOD_LABELS[method] || method}</span>
      },
    },
    {
      accessorKey: 'status',
      meta: { label: t('Status') },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Status')} />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const config = ORDER_STATUS_CONFIG[status]
        return (
          <Badge variant={config?.variant || 'outline'}>
            {t(config?.labelKey || status)}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'create_time',
      meta: { label: t('Create Time'), mobileHidden: true },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('Create Time')} />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-muted-foreground'>
          {formatTime(row.getValue('create_time') as number)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => <OrderRowActions row={row} />,
    },
  ]
}
