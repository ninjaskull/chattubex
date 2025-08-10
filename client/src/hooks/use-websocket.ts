import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface TypingUser {
  userId: string;
  timestamp: number;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (wsRef.current === ws) {
            connect();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    };

    const handleWebSocketMessage = (message: WebSocketMessage) => {
      switch (message.type) {
        case 'notes_init':
          // Initial notes data received
          queryClient.setQueryData(['/api/notes'], message.data);
          break;
          
        case 'note_created':
          // New note created
          queryClient.setQueryData(['/api/notes'], (oldData: any[]) => {
            if (!oldData) return [message.data];
            return [...oldData, message.data];
          });
          break;
          
        case 'note_updated':
          // Note updated
          queryClient.setQueryData(['/api/notes'], (oldData: any[]) => {
            if (!oldData) return [message.data];
            return oldData.map(note => 
              note.id === message.data.id ? message.data : note
            );
          });
          break;
          
        case 'note_deleted':
          // Note deleted
          queryClient.setQueryData(['/api/notes'], (oldData: any[]) => {
            if (!oldData) return [];
            return oldData.filter(note => note.id !== message.data.id);
          });
          break;

        case 'user_typing':
          // User is typing
          setTypingUsers(prev => {
            const filtered = prev.filter(user => user.userId !== message.data.userId);
            return [...filtered, { userId: message.data.userId, timestamp: Date.now() }];
          });
          break;

        case 'user_stopped_typing':
          // User stopped typing
          setTypingUsers(prev => prev.filter(user => user.userId !== message.data.userId));
          break;
          
        default:
          console.log('Unknown WebSocket message type:', message.type);
      }
    };

    connect();

    // Clean up typing users periodically
    const cleanupInterval = setInterval(() => {
      setTypingUsers(prev => prev.filter(user => Date.now() - user.timestamp < 5000));
    }, 2000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearInterval(cleanupInterval);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [queryClient]);

  const sendTyping = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        data: { userId: 'current_user' }
      }));
    }
  };

  const sendStoppedTyping = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'stopped_typing',
        data: { userId: 'current_user' }
      }));
    }
  };

  const handleTyping = () => {
    sendTyping();
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 1 second
    typingTimeoutRef.current = setTimeout(() => {
      sendStoppedTyping();
    }, 1000);
  };

  return { isConnected, typingUsers, handleTyping };
}