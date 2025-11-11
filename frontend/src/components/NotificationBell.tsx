'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import {
  formatNotificationDate,
  getNotificationColor,
  getNotificationIcon,
} from '@/services/notification.service';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    unreadCount,
    notifications,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();

  console.log('🔔 NotificationBell render:', {
    isOpen,
    unreadCount,
    notificationsLength: notifications.length,
    loading,
  });
  
  // Log detalhado das primeiras notificações
  if (notifications.length > 0) {
    console.log('📬 Primeiras notificações:', JSON.stringify(notifications.slice(0, 3), null, 2));
  }

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notificationId: string, read: boolean) => {
    if (!read) {
      await markNotificationAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do Sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        
        {/* Badge de contagem */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notificações
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Carregando...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.read)}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Ícone */}
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getNotificationColor(
                              notification.type
                            )}`}
                          >
                            {notification.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatNotificationDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/notificacoes"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver todas as notificações
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
