'use client';

import { useMemo } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { formatCurrency, formatDate } from '@/lib/currencyUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Users,
  FolderOpen,
} from 'lucide-react';

export default function Dashboard() {
  const { state, dispatch } = useInventory();

  const stats = useMemo(() => {
    const totalProducts = state.products.length;
    const totalValue = state.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const lowStockProducts = state.products.filter(product => product.quantity <= state.settings.lowStockThreshold);
    const outOfStockProducts = state.products.filter(product => product.quantity === 0);
    const totalCategories = state.categories.length;
    const totalSuppliers = state.suppliers.length;
    const avgProductValue = totalProducts > 0 ? totalValue / totalProducts : 0;

    return {
      totalProducts,
      totalValue,
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      totalCategories,
      totalSuppliers,
      avgProductValue,
      lowStockItems: lowStockProducts,
    };
  }, [state]);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(stats.totalValue, state.settings.currency),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts.toString(),
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockProducts.toString(),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Categories',
      value: stats.totalCategories.toString(),
      icon: FolderOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Suppliers',
      value: stats.totalSuppliers.toString(),
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to Dovepeak Inventory Manager</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {stats.lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Low Stock Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowStockItems.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={product.quantity === 0 ? "destructive" : "secondary"}>
                      {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} remaining`}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">Min: {product.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.category} • {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.price}</p>
                  <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}