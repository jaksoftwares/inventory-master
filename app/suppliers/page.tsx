'use client';

import { InventoryProvider } from '@/contexts/InventoryContext';
import Layout from '@/components/Layout';
import SuppliersView from '@/components/SuppliersView';

export default function SuppliersPage() {
  return (
    <InventoryProvider>
      <Layout>
        <SuppliersView />
      </Layout>
    </InventoryProvider>
  );
}