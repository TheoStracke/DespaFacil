'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Filter } from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  Notification,
  NotificationType,
  translateNotificationType,
  getNotificationColor,
  getNotificationIcon,
  formatNotificationDate,
} from '@/services/notification.service';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, typeFilter, notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await getNotifications({
        limit: 100,
      });
      setNotifications(result.notifications);
      setTotal(result.total);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Filtro de lidas/não lidas
    if (filter === 'unread') {
      filtered = filtered.filter((n) => !n.read);
    } else if (filter === 'read') {
      filtered = filtered.filter((n) => n.read);
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // Tipos únicos de notificações para o filtro
  const notificationTypes = Array.from(
    new Set(notifications.map((n) => n.type))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Notificações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount > 0
              ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}`
              : 'Todas as notificações estão lidas'}
          </p>
        </div>

        {/* Filtros e Ações */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filtro Lidas/Não Lidas */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas</option>
                <option value="unread">Não lidas</option>
                <option value="read">Lidas</option>
              </select>
            </div>

            {/* Filtro por Tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os tipos</option>
              {notificationTypes.map((type) => (
                <option key={type} value={type}>
                  {translateNotificationType(type)}
                </option>
              ))}
            </select>

            {/* Botão Marcar Todas como Lidas */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <CheckCheck className="h-4 w-4" />
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Carregando notificações...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Nenhuma notificação encontrada
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex-shrink-0 text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1"
                          title="Marcar como lida"
                        >
                          <Check className="h-4 w-4" />
                          Marcar lida
                        </button>
                      )}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {translateNotificationType(notification.type)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatNotificationDate(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          Nova
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Rodapé */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Exibindo {filteredNotifications.length} de {total} notificações
          </div>
        )}
      </div>
    </div>
  );
}
