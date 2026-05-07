import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useOrders } from './orders-provider'

export function OrdersCompleteDialog() {
  const { t } = useTranslation()
  const { open, setOpen, currentRow, triggerRefresh } = useOrders()

  const mutation = useMutation({
    mutationFn: async (tradeNo: string) => {
      const res = await api.post('/api/user/topup/complete', { trade_no: tradeNo })
      return res.data
    },
    onSuccess: () => {
      toast.success(t('Order completed successfully'))
      triggerRefresh()
      setOpen(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || t('Failed to complete order'))
    },
  })

  if (open !== 'complete' || !currentRow) return null

  return (
    <AlertDialog open onOpenChange={() => setOpen(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('Complete Order')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('Are you sure you want to manually complete this order? The user will be credited with the corresponding quota.')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='text-sm text-muted-foreground'>
          <p>{t('Trade No')}: <code>{currentRow.trade_no}</code></p>
          <p>{t('User ID')}: {currentRow.user_id}</p>
          <p>{t('Money')}: ${currentRow.money.toFixed(2)}</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutation.mutate(currentRow.trade_no)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('Processing...') : t('Confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
