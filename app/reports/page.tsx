'use client';

import { InventoryProvider } from '@/contexts/InventoryContext';
import Layout from '@/components/Layout';
import ReportsView from '@/components/ReportsView';

export default function ReportsPage() {
  return (
    <InventoryProvider>
      <Layout>
        <ReportsView />
      </Layout>
    </InventoryProvider>
  );
}