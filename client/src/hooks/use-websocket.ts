import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

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
          
        default:
          console.log('Unknown WebSocket message type:', message.type);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return { isConnected };
}