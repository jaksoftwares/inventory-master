'use client';

import { InventoryProvider } from '@/contexts/InventoryContext';
import Layout from '@/components/Layout';
import PurchaseOrdersView from '@/components/PurchaseOrdersView';

export default function PurchaseOrdersPage() {
  return (
    <InventoryProvider>
      <Layout>
        <PurchaseOrdersView />
      </Layout>
    </InventoryProvider>
  );
}