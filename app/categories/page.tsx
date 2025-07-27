'use client';

import { InventoryProvider } from '@/contexts/InventoryContext';
import Layout from '@/components/Layout';
import CategoriesView from '@/components/CategoriesView';

export default function CategoriesPage() {
  return (
    <InventoryProvider>
      <Layout>
        <CategoriesView />
      </Layout>
    </InventoryProvider>
  );
}