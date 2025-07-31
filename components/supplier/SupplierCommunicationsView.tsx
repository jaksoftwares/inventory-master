'use client';

import { useState, useMemo } from 'react';
import { useSupplier, Communication } from '@/contexts/SupplierContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Mail, AlertCircle, CheckCircle, Clock, User } from 'lucide-react';

export default function SupplierCommunicationsView() {
  const { state, dispatch } = useSupplier();
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [response, setResponse] = useState('');

  const filteredCommunications = useMemo(() => {
    return state.communications.filter(comm => {
      const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || comm.priority === priorityFilter;
      return matchesStatus && matchesPriority;
    });
  }, [state.communications, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-red-100 text-red-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inquiry':
        return <MessageSquare className="h-4 w-4" />;
      case 'order_update':
        return <CheckCircle className="h-4 w-4" />;
      case 'complaint':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <Mail className="h-4 w-4" />;
      case 'read':
        return <CheckCircle className="h-4 w-4" />;
      case 'responded':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const markAsRead = (commId: string) => {
    const comm = state.communications.find(c => c.id === commId);
    if (comm && comm.status === 'unread') {
      const updatedComm = { ...comm, status: 'read' as const };
      dispatch({ type: 'UPDATE_COMMUNICATION', payload: updatedComm });
    }
  };

  const handleRespond = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunication || !response.trim()) return;

    const updatedComm = {
      ...selectedCommunication,
      response: response,
      status: 'responded' as const,
      respondedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_COMMUNICATION', payload: updatedComm });
    setResponse('');
    setSelectedCommunication(null);
  };

  const updateStatus = (commId: string, newStatus: Communication['status']) => {
    const comm = state.communications.find(c => c.id === commId);
    if (comm) {
      const updatedComm = { ...comm, status: newStatus };
      dispatch({ type: 'UPDATE_COMMUNICATION', payload: updatedComm });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600 mt-2">Manage customer communications and inquiries</p>
        </div>
        
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Communications List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCommunications.map((comm) => (
          <Card key={comm.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {getTypeIcon(comm.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{comm.subject}</CardTitle>
                    <p className="text-sm text-gray-600">From: {comm.customerName}</p>
                    <p className="text-xs text-gray-500">{new Date(comm.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge className={getStatusColor(comm.status)}>
                    {comm.status}
                  </Badge>
                  <Badge className={getPriorityColor(comm.priority)}>
                    {comm.priority} priority
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Message:</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{comm.message}</p>
                </div>

                {comm.response && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Your Response:</p>
                    <p className="text-sm bg-green-50 p-3 rounded-lg border border-green-200">{comm.response}</p>
                    {comm.respondedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Responded on: {new Date(comm.respondedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  {comm.status === 'unread' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(comm.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                  
                  {(comm.status === 'read' || comm.status === 'unread') && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCommunication(comm);
                            markAsRead(comm.id);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Respond
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Respond to: {comm.subject}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRespond} className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Original Message:</p>
                            <p className="text-sm bg-gray-50 p-3 rounded-lg">{comm.message}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">Your Response:</label>
                            <Textarea
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              rows={4}
                              placeholder="Type your response here..."
                              required
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                              Send Response
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {comm.status === 'responded' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(comm.id, 'closed')}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCommunications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
            <p className="text-gray-600">
              {statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Customer messages and inquiries will appear here'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}