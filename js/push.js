import { api } from './api.js';

/**
 * Returns the current push subscription state:
 *   'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'
 */
export async function getPushState() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'denied') return 'denied';

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return sub ? 'subscribed' : 'unsubscribed';
}

/** Subscribe this device to push notifications. */
export async function subscribePush() {
  const { key } = await api.getVapidKey();
  if (!key) throw new Error('VAPID key not configured on server');

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });

  const json = sub.toJSON();
  await api.pushSubscribe({
    endpoint: json.endpoint,
    keys: json.keys,
  });
  return sub;
}

/** Unsubscribe this device from push notifications. */
export async function unsubscribePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  await api.pushUnsubscribe(endpoint);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
