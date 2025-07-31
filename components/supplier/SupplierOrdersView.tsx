'use client';

import { useState, useMemo } from 'react';
import { useSupplier, SupplierOrder } from '@/contexts/SupplierContext';
import { formatCurrency, formatDate } from '@/lib/currencyUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingCart, Calendar, DollarSign, Package, Truck, CheckCircle } from 'lucide-react';

export default function SupplierOrdersView() {
  const { state, dispatch } = useSupplier();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    return state.orders.filter(order => {
      return statusFilter === 'all' || order.status === statusFilter;
    });
  }, [state.orders, statusFilter]);

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Calendar className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: SupplierOrder['status']) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrder = { ...order, status: newStatus };
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });

    // Update customer stats if order is completed
    if (newStatus === 'delivered') {
      const customer = state.customers.find(c => c.id === order.customerId);
      if (customer) {
        const updatedCustomer = {
          ...customer,
          totalOrders: customer.totalOrders + 1,
          totalSpent: customer.totalSpent + order.totalAmount,
          lastOrderDate: new Date(),
        };
        dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
      }
    }
  };

  const getNextStatus = (currentStatus: string): SupplierOrder['status'] | null => {
    switch (currentStatus) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'processing';
      case 'processing':
        return 'shipped';
      case 'shipped':
        return 'delivered';
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string): string => {
    switch (currentStatus) {
      case 'pending':
        return 'Confirm Order';
      case 'confirmed':
        return 'Start Processing';
      case 'processing':
        return 'Mark as Shipped';
      case 'shipped':
        return 'Mark as Delivered';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Manage customer orders and fulfillment</p>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span>Order #{order.id}</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Customer: {order.customerName}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium">{formatDate(new Date(order.orderDate), 'MM/DD/YYYY')}</p>
                    </div>
                  </div>
                  {order.expectedDelivery && (
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Expected Delivery</p>
                        <p className="font-medium">{formatDate(new Date(order.expectedDelivery), 'MM/DD/YYYY')}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium">{formatCurrency(order.totalAmount, state.settings.currency)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{item.productName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">
                            {item.quantity} × {formatCurrency(item.unitPrice, state.settings.currency)} = {formatCurrency(item.totalPrice, state.settings.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium ml-2">{formatCurrency(order.subtotal, state.settings.currency)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium ml-2">{formatCurrency(order.tax, state.settings.currency)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium ml-2">{formatCurrency(order.shipping, state.settings.currency)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold ml-2">{formatCurrency(order.totalAmount, state.settings.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Shipping Address:</p>
                  <p className="text-sm">{order.shippingAddress}</p>
                  {order.notes && (
                    <>
                      <p className="text-sm text-gray-600 mt-2 mb-1">Notes:</p>
                      <p className="text-sm">{order.notes}</p>
                    </>
                  )}
                  {order.trackingNumber && (
                    <>
                      <p className="text-sm text-gray-600 mt-2 mb-1">Tracking Number:</p>
                      <p className="text-sm font-mono">{order.trackingNumber}</p>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4 border-t">
                  {getNextStatus(order.status) && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {getNextStatusLabel(order.status)}
                    </Button>
                  )}
                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="text-red-600 hover:text-red-700"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {statusFilter !== 'all' 
                ? `No orders with status "${statusFilter}"`
                : 'Orders from customers will appear here'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}