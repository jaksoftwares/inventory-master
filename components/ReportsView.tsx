'use client';

import { useMemo } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { generatePDFReport, ReportData } from '@/lib/pdfGenerator';
import { formatCurrency, formatDate } from '@/lib/currencyUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  AlertTriangle,
  Download,
  FileText,
} from 'lucide-react';

export default function ReportsView() {
  const { state, dispatch } = useInventory();

  const reports = useMemo(() => {
    const totalProducts = state.products.length;
    const totalValue = state.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const totalCost = state.products.reduce((sum, product) => sum + (product.cost * product.quantity), 0);
    const potentialProfit = totalValue - totalCost;
    
    const lowStockProducts = state.products.filter(product => product.quantity <= product.minStock);
    const outOfStockProducts = state.products.filter(product => product.quantity === 0);
    
    // Category analysis
    const categoryStats = state.categories.map(category => {
      const categoryProducts = state.products.filter(p => p.category === category.name);
      const categoryValue = categoryProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      return {
        name: category.name,
        productCount: categoryProducts.length,
        totalValue: categoryValue,
        averageValue: categoryProducts.length > 0 ? categoryValue / categoryProducts.length : 0,
      };
    }).sort((a, b) => b.totalValue - a.totalValue);

    // Supplier analysis
    const supplierStats = state.suppliers.map(supplier => {
      const supplierProducts = state.products.filter(p => p.supplier === supplier.name);
      const supplierValue = supplierProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      return {
        name: supplier.name,
        productCount: supplierProducts.length,
        totalValue: supplierValue,
      };
    }).sort((a, b) => b.totalValue - a.totalValue);

    // Top products by value
    const topProductsByValue = [...state.products]
      .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
      .slice(0, 10);

    return {
      overview: {
        totalProducts,
        totalValue,
        totalCost,
        potentialProfit,
        profitMargin: totalValue > 0 ? ((potentialProfit / totalValue) * 100) : 0,
      },
      stock: {
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        lowStockProducts: lowStockProducts.slice(0, 5),
        outOfStockProducts: outOfStockProducts.slice(0, 5),
      },
      categories: categoryStats,
      suppliers: supplierStats,
      topProducts: topProductsByValue,
    };
  }, [state]);

  const exportToPDF = async (type: string) => {
    let reportData: ReportData;
    const companyInfo = {
      name: state.settings.companyName,
      address: state.settings.companyAddress,
      phone: state.settings.companyPhone,
      email: state.settings.companyEmail,
    };

    switch (type) {
      case 'inventory':
        reportData = {
          title: 'Inventory Report',
          columns: ['Name', 'SKU', 'Category', 'Supplier', 'Quantity', 'Cost Price', 'Selling Price', 'Total Value'],
          data: state.products.map(p => ({
            Name: p.name,
            SKU: p.sku,
            Category: p.category,
            Supplier: p.supplier,
            Quantity: p.quantity,
            'Cost Price': formatCurrency(p.cost, state.settings.currency),
            'Selling Price': formatCurrency(p.price, state.settings.currency),
            'Total Value': formatCurrency(p.price * p.quantity, state.settings.currency),
          })),
          summary: {
            'Total Products': state.products.length,
            'Total Inventory Value': formatCurrency(reports.overview.totalValue, state.settings.currency),
            'Low Stock Items': reports.stock.lowStockCount,
            'Out of Stock Items': reports.stock.outOfStockCount,
          },
          companyInfo,
        };
        break;
      case 'categories':
        reportData = {
          title: 'Category Performance Report',
          columns: ['Category', 'Products', 'Total Value', 'Average Value'],
          data: reports.categories.map(c => ({
            Category: c.name,
            Products: c.productCount,
            'Total Value': formatCurrency(c.totalValue, state.settings.currency),
            'Average Value': formatCurrency(c.averageValue, state.settings.currency),
          })),
          companyInfo,
        };
        break;
      case 'suppliers':
        reportData = {
          title: 'Supplier Analysis Report',
          columns: ['Supplier', 'Products', 'Total Value'],
          data: reports.suppliers.map(s => ({
            Supplier: s.name,
            Products: s.productCount,
            'Total Value': formatCurrency(s.totalValue, state.settings.currency),
          })),
          companyInfo,
        };
        break;
      case 'stock-movements':
        reportData = {
          title: 'Stock Movement Report',
          columns: ['Date', 'Product', 'Type', 'Quantity', 'Reason', 'Reference'],
          data: state.stockMovements.map(sm => {
            const product = state.products.find(p => p.id === sm.productId);
            return {
              Date: formatDate(new Date(sm.date), state.settings.dateFormat),
              Product: product?.name || 'Unknown',
              Type: sm.type === 'in' ? 'Stock In' : 'Stock Out',
              Quantity: sm.quantity,
              Reason: sm.reason,
              Reference: sm.reference,
            };
          }),
          companyInfo,
        };
        break;
      default:
        return;
    }

    await generatePDFReport(reportData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your inventory</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportToPDF('inventory')}>
            <Download className="h-4 w-4 mr-2" />
            Inventory PDF
          </Button>
          <Button variant="outline" onClick={() => exportToPDF('categories')}>
            <Download className="h-4 w-4 mr-2" />
            Categories PDF
          </Button>
          <Button variant="outline" onClick={() => exportToPDF('suppliers')}>
            <Download className="h-4 w-4 mr-2" />
            Suppliers PDF
          </Button>
          <Button variant="outline" onClick={() => exportToPDF('stock-movements')}>
            <Download className="h-4 w-4 mr-2" />
            Stock Movements PDF
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{reports.overview.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(reports.overview.totalValue, state.settings.currency)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Potential Profit</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(reports.overview.potentialProfit, state.settings.currency)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                <p className="text-3xl font-bold text-gray-900">
                  {reports.overview.profitMargin.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Low Stock Items</span>
              <Badge variant="secondary">{reports.stock.lowStockCount}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports.stock.lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {reports.stock.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{product.quantity} remaining</Badge>
                      <p className="text-xs text-gray-500 mt-1">Min: {product.minStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No low stock items</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span>Out of Stock</span>
              <Badge variant="destructive">{reports.stock.outOfStockCount}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports.stock.outOfStockProducts.length > 0 ? (
              <div className="space-y-3">
                {reports.stock.outOfStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    </div>
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No out of stock items</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.categories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.productCount} products</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(category.totalValue, state.settings.currency)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Avg: {formatCurrency(category.averageValue, state.settings.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products by Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.category} • {product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(product.price * product.quantity, state.settings.currency)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(product.price, state.settings.currency)} × {product.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}