import { useTranslation } from 'react-i18next'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { SectionPageLayout } from '@/components/layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrdersProvider } from './components/orders-provider'
import { OrdersTable } from './components/orders-table'
import { OrdersStatistics } from './components/orders-statistics'
import { OrdersExportButton } from './components/orders-export-button'

export function Orders() {
  const { t } = useTranslation()
  const search = useSearch({ from: '/_authenticated/orders/' })
  const navigate = useNavigate()

  const activeTab = search.tab || 'list'

  return (
    <OrdersProvider>
      <SectionPageLayout>
        <SectionPageLayout.Title>
          {t('Order Management')}
        </SectionPageLayout.Title>
        <SectionPageLayout.Actions>
          <OrdersExportButton />
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              navigate({
                to: '/orders',
                search: { ...search, tab: value as 'list' | 'statistics' },
              })
            }
          >
            <TabsList>
              <TabsTrigger value='list'>{t('Order List')}</TabsTrigger>
              <TabsTrigger value='statistics'>{t('Statistics')}</TabsTrigger>
            </TabsList>
            <TabsContent value='list' className='mt-4'>
              <OrdersTable />
            </TabsContent>
            <TabsContent value='statistics' className='mt-4'>
              <OrdersStatistics />
            </TabsContent>
          </Tabs>
        </SectionPageLayout.Content>
      </SectionPageLayout>
    </OrdersProvider>
  )
}
