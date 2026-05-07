import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { DataTablePage } from '@/components/data-table'
import { getOrders } from '../api'
import type { UnifiedOrder } from '../types'
import { useOrdersColumns } from './orders-columns'
import { useOrders } from './orders-provider'
import { OrdersCompleteDialog } from './orders-complete-dialog'
import { OrdersToolbar } from './orders-toolbar'

const route = getRouteApi('/_authenticated/orders/')

export function OrdersTable() {
  const { t } = useTranslation()
  const columns = useOrdersColumns()
  const { refreshTrigger } = useOrders()
  const search = route.useSearch()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 20 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [{ columnId: 'status', searchKey: 'status', type: 'string' }],
  })

  const orderType = search.type === 'all' ? '' : (search.type || '')
  const orderStatus = search.status === 'all' ? '' : (search.status || '')
  const paymentMethod = search.paymentMethod || ''

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'admin-orders',
      pagination.pageIndex + 1,
      pagination.pageSize,
      globalFilter,
      orderType,
      orderStatus,
      paymentMethod,
      search.startTime,
      search.endTime,
      refreshTrigger,
    ],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        p: pagination.pageIndex + 1,
        page_size: pagination.pageSize,
      }
      if (globalFilter?.trim()) params.keyword = globalFilter
      if (orderType) params.type = orderType
      if (orderStatus) params.status = orderStatus
      if (paymentMethod) params.payment_method = paymentMethod
      if (search.startTime) params.start_time = search.startTime
      if (search.endTime) params.end_time = search.endTime

      const result = await getOrders(params as Parameters<typeof getOrders>[0])
      return {
        items: result.data?.items || [],
        total: result.data?.total || 0,
      }
    },
    placeholderData: (previousData) => previousData,
  })

  const orders: UnifiedOrder[] = useMemo(() => data?.items || [], [data])

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    manualPagination: true,
    pageCount: Math.ceil((data?.total || 0) / pagination.pageSize),
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <>
      <DataTablePage
        table={table}
        columns={columns}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyTitle={t('No Orders Found')}
        emptyDescription={t('No orders match the current filters.')}
        skeletonKeyPrefix='orders-skeleton'
        toolbar={<OrdersToolbar table={table} />}
      />
      <OrdersCompleteDialog />
    </>
  )
}
