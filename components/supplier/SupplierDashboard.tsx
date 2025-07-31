'use client';

import { useMemo } from 'react';
import { useSupplier } from '@/contexts/SupplierContext';
import { formatCurrency } from '@/lib/currencyUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export default function SupplierDashboard() {
  const { state } = useSupplier();

  const stats = useMemo(() => {
    const totalProducts = state.products.length;
    const activeProducts = state.products.filter(p => p.status === 'active').length;
    const lowStockProducts = state.products.filter(p => p.quantity <= p.minStock).length;
    
    const totalCustomers = state.customers.length;
    const activeCustomers = state.customers.filter(c => c.status === 'active').length;
    
    const totalOrders = state.orders.length;
    const pendingOrders = state.orders.filter(o => o.status === 'pending').length;
    const processingOrders = state.orders.filter(o => o.status === 'processing').length;
    
    const totalRevenue = state.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const monthlyRevenue = state.orders
      .filter(order => {
        const orderDate = new Date(order.orderDate);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    const unreadCommunications = state.communications.filter(c => c.status === 'unread').length;
    const highPriorityCommunications = state.communications.filter(c => c.priority === 'high' && c.status !== 'closed').length;

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalCustomers,
      activeCustomers,
      totalOrders,
      pendingOrders,
      processingOrders,
      totalRevenue,
      monthlyRevenue,
      unreadCommunications,
      highPriorityCommunications,
    };
  }, [state]);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      subtitle: `${stats.activeProducts} active`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      subtitle: `${stats.activeCustomers} active`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      subtitle: `${stats.pendingOrders} pending`,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue, state.settings.currency),
      subtitle: 'This month',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts.toString(),
      subtitle: 'Need attention',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Unread Messages',
      value: stats.unreadCommunications.toString(),
      subtitle: `${stats.highPriorityCommunications} high priority`,
      icon: MessageSquare,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your supplier workspace</p>
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
                  <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Recent Orders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900">Order #{order.id}</h4>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <Badge className={getOrderStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {formatCurrency(order.totalAmount, state.settings.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {stats.lowStockProducts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Low Stock Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.products
                .filter(product => product.quantity <= product.minStock)
                .slice(0, 5)
                .map((product) => (
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

      {/* Recent Communications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Recent Communications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.communications.slice(0, 5).map((comm) => (
              <div key={comm.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900">{comm.subject}</h4>
                  <p className="text-sm text-gray-600">From: {comm.customerName}</p>
                  <p className="text-xs text-gray-500">{new Date(comm.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <Badge variant={comm.status === 'unread' ? 'destructive' : 'default'}>
                    {comm.status}
                  </Badge>
                  <Badge variant={comm.priority === 'high' ? 'destructive' : comm.priority === 'medium' ? 'secondary' : 'outline'} className="ml-2">
                    {comm.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}