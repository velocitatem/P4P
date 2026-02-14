'use client';

import { useEffect } from 'react';
import type { EventName } from '@/lib/events';

const dispatchInteraction = (eventName: EventName, metadata?: Record<string, unknown>) => {
  const e = new CustomEvent('definedInteraction', {
    detail: { eventName, metadata },
  });
  document.dispatchEvent(e);
};

export default function AirlineCheckout() {
  useEffect(() => {
    // emit purchase_complete when checkout page loads
    dispatchInteraction('purchase_complete', {
      completedAt: new Date().toISOString(),
      storeMode: 'airline',
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-light text-gray-800 mb-4">
          Thank you for flying with us
        </h1>
      </div>
    </div>
  );
}
