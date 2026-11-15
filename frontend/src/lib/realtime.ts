import { useEffect, useRef } from 'react';

export type SyncEventType =
  | 'suggestions'
  | 'loans'
  | 'reservations'
  | 'fines'
  | 'notifications'
  | 'dashboard'
  | 'books';

interface SyncMessage {
  type: SyncEventType;
  timestamp: number;
  payload?: any;
}

const CHANNEL_NAME = 'uth_library_realtime_sync';

// Singleton BroadcastChannel for cross-tab / cross-window communication
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('[Realtime] BroadcastChannel not supported in this environment', e);
}

/**
 * Broadcast a realtime sync event across all tabs, windows, and local components.
 */
export const broadcastRealtimeSync = (type: SyncEventType, payload?: any) => {
  const message: SyncMessage = {
    type,
    timestamp: Date.now(),
    payload,
  };

  // 1. Send to other browser tabs/windows
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(message);
    } catch (e) {
      console.debug('[Realtime] Failed to broadcast message:', e);
    }
  }

  // 2. Dispatch local CustomEvent for components in current window
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('uth-realtime-sync', {
        detail: message,
      })
    );
  }
};

/**
 * Custom hook to subscribe a page/component to realtime sync events.
 * 
 * Triggers `onSync` when:
 * 1. A matching sync event is broadcasted (from current or other tabs).
 * 2. The browser window/tab gains focus.
 * 3. Periodic polling interval fires (default: 5000ms).
 */
export const useRealtimeSync = (
  types: SyncEventType | SyncEventType[],
  onSync: () => void,
  pollingIntervalMs: number = 5000
) => {
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  const typeList = Array.isArray(types) ? types : [types];
  const typeListKey = typeList.sort().join(',');

  useEffect(() => {
    const handleSync = (receivedType: SyncEventType) => {
      if (typeList.includes(receivedType)) {
        onSyncRef.current();
      }
    };

    // 1. Listen for BroadcastChannel messages (from other windows/tabs)
    const handleBroadcastMessage = (event: MessageEvent<SyncMessage>) => {
      if (event.data && event.data.type) {
        handleSync(event.data.type);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }

    // 2. Listen for local window CustomEvent (within same tab)
    const handleLocalEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SyncMessage>;
      if (customEvent.detail && customEvent.detail.type) {
        handleSync(customEvent.detail.type);
      }
    };
    window.addEventListener('uth-realtime-sync', handleLocalEvent);

    // 3. Listen for window focus to refresh immediately when user views the tab
    const handleWindowFocus = () => {
      onSyncRef.current();
    };
    window.addEventListener('focus', handleWindowFocus);

    // 4. Periodic polling interval for cross-device/background changes
    let intervalId: NodeJS.Timeout | null = null;
    if (pollingIntervalMs > 0) {
      intervalId = setInterval(() => {
        // Only run polling if the document is visible
        if (typeof document !== 'undefined' && !document.hidden) {
          onSyncRef.current();
        }
      }, pollingIntervalMs);
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcastMessage);
      }
      window.removeEventListener('uth-realtime-sync', handleLocalEvent);
      window.removeEventListener('focus', handleWindowFocus);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [typeListKey, pollingIntervalMs]);
};

