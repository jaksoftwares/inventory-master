'use client';

import { Menu, Search, Bell, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupplier } from '@/contexts/SupplierContext';

interface SupplierHeaderProps {
  onMenuClick: () => void;
}

export default function SupplierHeader({ onMenuClick }: SupplierHeaderProps) {
  const { saveToStorage } = useSupplier();

  const handleRefresh = () => {
    saveToStorage();
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products, customers, orders..."
              className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>

          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <span>Last sync:</span>
            <span className="font-medium">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}