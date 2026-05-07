import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { exportOrders } from '../api'

export function OrdersExportButton() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_authenticated/orders/' })

  const handleExport = async () => {
    try {
      const filter: Record<string, unknown> = {}
      const type = search.type === 'all' ? '' : (search.type || '')
      if (type) filter.type = type
      const status = search.status === 'all' ? '' : (search.status || '')
      if (status) filter.status = status
      if (search.paymentMethod) filter.payment_method = search.paymentMethod
      if (search.startTime) filter.start_time = search.startTime
      if (search.endTime) filter.end_time = search.endTime
      if (search.filter) filter.keyword = search.filter

      const blob = await exportOrders(filter)
      const url = window.URL.createObjectURL(blob as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success(t('Export successful'))
    } catch {
      toast.error(t('Export failed'))
    }
  }

  return (
    <Button variant='outline' size='sm' onClick={handleExport}>
      <Download className='mr-2 h-4 w-4' />
      {t('Export CSV')}
    </Button>
  )
}
