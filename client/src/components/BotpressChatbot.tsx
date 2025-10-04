import { useEffect } from 'react';

export function BotpressChatbot() {
  useEffect(() => {
    // Get Botpress configuration from environment variables
    const botId = import.meta.env.VITE_BOTPRESS_BOT_ID;
    const hostUrl = import.meta.env.VITE_BOTPRESS_HOST_URL || 'https://cdn.botpress.cloud/webchat/v1';
    const configUrl = import.meta.env.VITE_BOTPRESS_CONFIG_URL;

    // Only load if bot ID or config URL is provided
    if (!botId && !configUrl) {
      console.warn('Botpress chatbot not configured. Please set VITE_BOTPRESS_BOT_ID or VITE_BOTPRESS_CONFIG_URL in your environment variables.');
      return;
    }

    // Load Botpress webchat script
    const script = document.createElement('script');
    script.src = `${hostUrl}/inject.js`;
    script.async = true;
    document.body.appendChild(script);

    // Configure Botpress webchat
    script.onload = () => {
      if (window.botpressWebChat) {
        window.botpressWebChat.init({
          botId: botId,
          hostUrl: hostUrl,
          configUrl: configUrl,
          messagingUrl: import.meta.env.VITE_BOTPRESS_MESSAGING_URL,
          clientId: import.meta.env.VITE_BOTPRESS_CLIENT_ID,
          // Styling configuration
          stylesheet: import.meta.env.VITE_BOTPRESS_STYLESHEET_URL,
          // Additional configuration
          hideWidget: false,
          disableAnimations: false,
          closeOnEscape: true,
          showConversationsButton: true,
          enableTranscriptDownload: false,
          className: 'botpress-webchat',
        });
      }
    };

    // Cleanup
    return () => {
      const webchatScript = document.querySelector(`script[src="${hostUrl}/inject.js"]`);
      if (webchatScript) {
        document.body.removeChild(webchatScript);
      }
      
      // Remove Botpress webchat elements
      const webchatContainer = document.getElementById('bp-web-widget');
      if (webchatContainer) {
        webchatContainer.remove();
      }
    };
  }, []);

  return null;
}

// Type declarations for Botpress
declare global {
  interface Window {
    botpressWebChat: {
      init: (config: any) => void;
      sendEvent: (event: any) => void;
      sendPayload: (payload: any) => void;
      mergeConfig: (config: any) => void;
    };
  }
}
