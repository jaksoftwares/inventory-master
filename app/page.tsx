'use client';

import { InventoryProvider } from '@/contexts/InventoryContext';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <InventoryProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </InventoryProvider>
  );
}