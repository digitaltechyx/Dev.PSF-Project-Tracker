
"use client";

import { useMemo } from 'react';
import { query, collection, where, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { Notification } from '@/lib/types';

/**
 * Hook to fetch notifications for the currently authenticated user in real-time.
 * It enforces the 'userId' filter required by Firestore Security Rules.
 */
export function useNotifications(max: number = 20) {
  const db = useFirestore();
  const { user, isAuthReady } = useUser();

  // The query MUST include a filter on 'userId' that matches the authenticated user's UID.
  // This is required to satisfy the Firestore Security Rule: allow read: if resource.data.userId == request.auth.uid;
  const notificationsQuery = useMemoFirebase(() => {
    // We only construct the query if the user is authenticated and the store is ready.
    // Checking user?.uid ensures we have a stable ID for the filter.
    if (!db || !user?.uid || !isAuthReady) return null;
    
    return query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(max)
    );
  }, [db, user?.uid, isAuthReady, max]);

  // useCollection handles the real-time subscription and emits 'permission-error' events if rules fail.
  const { data, isLoading, error } = useCollection<Notification>(notificationsQuery);

  const unreadCount = useMemo(() => {
    if (!data) return 0;
    return data.filter(n => !n.read).length;
  }, [data]);

  return {
    notifications: data || [],
    unreadCount,
    isLoading: !isAuthReady || isLoading,
    error
  };
}
