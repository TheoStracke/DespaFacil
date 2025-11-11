import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getUnreadCount,
  getNotifications,
  markAsRead,
  markAllAsRead,
  Notification,
} from '@/services/notification.service';
import { toast } from 'sonner';

const POLLING_INTERVAL = 30000; // 30 segundos

// Som de notificação
const playNotificationSound = () => {
  try {
    // Criar um AudioContext para gerar um beep
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Frequência do beep
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (err) {
    console.log('Erro ao tocar som:', err);
  }
};

interface UseNotificationsReturn {
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

/**
 * Hook para gerenciar notificações com polling automático
 * Busca notificações a cada 30 segundos e mostra toast para novas notificações
 */
export function useNotifications(): UseNotificationsReturn {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const previousUnreadCount = useRef(0);
  const isFirstLoad = useRef(true);

  /**
   * Busca contagem de não lidas
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      
      // Se aumentou a contagem (detectou novas notificações)
      if (!isFirstLoad.current && count > previousUnreadCount.current) {
        const newNotificationsCount = count - previousUnreadCount.current;
        console.log(`🔔 ${newNotificationsCount} nova(s) notificação(ões)`);
        
        // Tocar som
        playNotificationSound();
        
        // Mostrar toast
        toast.info(`Você tem ${newNotificationsCount} nova(s) notificação(ões)`, {
          duration: 5000,
        });
      }
      
      previousUnreadCount.current = count;
      setUnreadCount(count);
      
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações:', error);
    }
  }, []);

  /**
   * Busca últimas notificações
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Buscando notificações...');
      const result = await getNotifications({
        limit: 10,
        offset: 0,
      });
      console.log('📬 Notificações recebidas:', result);
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marca uma notificação como lida
   */
  const markNotificationAsRead = useCallback(async (id: string) => {
    try {
      await markAsRead(id);
      
      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, []);

  /**
   * Marca todas as notificações como lidas
   */
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      
      // Atualizar estado local
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, []);

  /**
   * Atualiza notificações manualmente
   */
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
    await fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Polling automático
  useEffect(() => {
    // Buscar imediatamente ao montar
    fetchNotifications();
    fetchUnreadCount();

    // Configurar polling
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, POLLING_INTERVAL);

    // Limpar intervalo ao desmontar
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchNotifications, fetchUnreadCount]);

  // Atualizar notificações quando o unreadCount mudar (detectou novas)
  useEffect(() => {
    if (!isFirstLoad.current && unreadCount > previousUnreadCount.current) {
      fetchNotifications();
    }
  }, [unreadCount, fetchNotifications]);

  return {
    unreadCount,
    notifications,
    loading,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
}
