'use client';

import { InventoryProvider } from '@/contexts/InventoryContext';
import Layout from '@/components/Layout';
import StockView from '@/components/StockView';

export default function StockPage() {
  return (
    <InventoryProvider>
      <Layout>
        <StockView />
      </Layout>
    </InventoryProvider>
  );
}