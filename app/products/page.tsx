'use client';

import { InventoryProvider } from '@/contexts/InventoryContext';
import Layout from '@/components/Layout';
import ProductsView from '@/components/ProductsView';

export default function ProductsPage() {
  return (
    <InventoryProvider>
      <Layout>
        <ProductsView />
      </Layout>
    </InventoryProvider>
  );
}