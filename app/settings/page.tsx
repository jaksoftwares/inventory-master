'use client';

import { InventoryProvider } from '@/contexts/InventoryContext';
import Layout from '@/components/Layout';
import SettingsView from '@/components/SettingsView';

export default function SettingsPage() {
  return (
    <InventoryProvider>
      <Layout>
        <SettingsView />
      </Layout>
    </InventoryProvider>
  );
}