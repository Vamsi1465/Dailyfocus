import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';

const PERMISSION_DISMISSED_KEY = 'notification-prompt-dismissed';

export function NotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      return;
    }

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    // Only show if permission hasn't been decided and user hasn't dismissed
    if (currentPermission === 'default') {
      const dismissed = localStorage.getItem(PERMISSION_DISMISSED_KEY);
      if (!dismissed) {
        // Small delay to not overwhelm on first load
        setTimeout(() => setIsVisible(true), 1500);
      }
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setIsVisible(false);
      
      if (result === 'granted') {
        // Show a test notification
        new Notification('Notifications Enabled! 🔔', {
          body: 'You\'ll now receive alerts when blocks start and end.',
          icon: '/favicon.ico'
        });
      }
    } catch (e) {
      console.error('Error requesting notification permission', e);
    }
  };

  const dismiss = () => {
    localStorage.setItem(PERMISSION_DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-up">
      <div className="bg-card rounded-xl border border-border shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              Enable Notifications
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get alerts when it's time to switch blocks, even when this tab is in the background.
            </p>
            
            <div className="flex gap-2">
              <Button size="sm" onClick={requestPermission}>
                Enable
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Not now
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-1 -mr-1"
            onClick={dismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
