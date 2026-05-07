import { type Row } from '@tanstack/react-table'
import { MoreHorizontal, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UnifiedOrder } from '../types'
import { useOrders } from './orders-provider'

interface OrderRowActionsProps {
  row: Row<UnifiedOrder>
}

export function OrderRowActions({ row }: OrderRowActionsProps) {
  const { t } = useTranslation()
  const { setOpen, setCurrentRow } = useOrders()
  const order = row.original

  if (order.status !== 'pending') return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant='ghost' className='h-8 w-8 p-0' />}
      >
        <span className='sr-only'>{t('Open menu')}</span>
        <MoreHorizontal className='h-4 w-4' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(order)
            setOpen('complete')
          }}
        >
          <CheckCircle className='mr-2 h-4 w-4' />
          {t('Complete Order')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
