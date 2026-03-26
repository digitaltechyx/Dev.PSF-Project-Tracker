"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, ShieldCheck, LogIn, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function JoinPage() {
  const { inviteId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitation details
  useEffect(() => {
    const fetchInvite = async () => {
      if (!db || !inviteId) return;
      try {
        const docRef = doc(db, 'invitations', inviteId as string);
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) {
          setError('Invalid or expired invitation link.');
          return;
        }
        
        const data = snap.data();
        
        // Expiry Check
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          setError('This invitation has expired.');
          return;
        }
        
        // Usage Check
        if (data.maxUses !== 'unlimited' && data.usageCount >= data.maxUses) {
          setError('This invitation link has reached its maximum uses.');
          return;
        }

        if (data.status !== 'active') {
          setError('This invitation is no longer active.');
          return;
        }

        setInvite(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [db, inviteId]);

  // Sync user profile and check existing membership
  useEffect(() => {
    const syncAndCheck = async () => {
      if (user && db && invite) {
        // Sync user profile first
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          id: user.uid,
          name: user.displayName || 'User',
          email: user.email?.toLowerCase() || '',
          avatarUrl: user.photoURL,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Check if already a member
        const wsRef = doc(db, 'workspaces', invite.workspaceId);
        const wsSnap = await getDoc(wsRef);
        if (wsSnap.exists()) {
          const wsData = wsSnap.data();
          if (wsData.memberRoles && wsData.memberRoles[user.uid]) {
            setJoined(true);
            setTimeout(() => router.push('/'), 1500);
          }
        }
      }
    };

    syncAndCheck();
  }, [user, db, invite, router]);

  const handleLogin = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') return;
      console.error("Login failed:", err);
      setError('Login failed: ' + (err.message || 'Please try again.'));
    }
  };

  const handleJoin = async () => {
    if (!user || !invite || !db) return;
    setJoining(true);
    setError(null);
    try {
      const wsRef = doc(db, 'workspaces', invite.workspaceId);
      const wsSnap = await getDoc(wsRef);
      
      if (!wsSnap.exists()) {
        throw new Error('Workspace no longer exists.');
      }

      const wsData = wsSnap.data();
      
      // Update workspace member roles
      const newRoles = { 
        ...(wsData.memberRoles || {}), 
        [user.uid]: invite.role 
      };
      
      // Perform join operations
      await Promise.all([
        updateDoc(wsRef, { memberRoles: newRoles }),
        setDoc(doc(db, 'workspaces', invite.workspaceId, 'members', user.uid), {
          id: user.uid,
          workspaceId: invite.workspaceId,
          userId: user.uid,
          displayName: user.displayName || 'Anonymous',
          email: user.email || '',
          avatarUrl: user.photoURL || null,
        }, { merge: true }),
        updateDoc(doc(db, 'invitations', inviteId as string), { usageCount: increment(1) })
      ]);

      setJoined(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      console.error("Join failed:", err);
      setError('Failed to join workspace: ' + (err.message || 'Permissions error.'));
    } finally {
      setJoining(false);
    }
  };

  if (loading || (isUserLoading && !user)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full border-none shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {joined ? <CheckCircle2 className="h-8 w-8 text-green-500" /> : <Users className="h-8 w-8 text-primary" />}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold font-headline">
              {joined ? 'Welcome to the team!' : 'Join Workspace'}
            </CardTitle>
            <CardDescription>
              {error ? 'There was an issue with your invitation' : 
               joined ? 'Redirecting you to the dashboard...' : 
               `You've been invited to join ${invite?.workspaceName}`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-3 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          ) : !joined ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Invited by</span>
                  <span className="font-semibold">{invite.invitedByName}</span>
                </div>
                <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Your Role</span>
                  <div className="flex items-center gap-1.5 font-semibold capitalize">
                    {invite.role === 'lead' ? <ShieldCheck className="h-4 w-4 text-primary" /> : <Users className="h-4 w-4" />}
                    {invite.role}
                  </div>
                </div>
              </div>

              {!user ? (
                <div className="space-y-4">
                  <p className="text-xs text-center text-muted-foreground">You must be signed in to accept this invitation.</p>
                  <Button className="w-full gap-2 h-11" onClick={handleLogin}>
                    <LogIn className="h-5 w-5" />
                    Sign in with Google
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-card/50">
                    <img src={user.photoURL || ''} className="h-10 w-10 rounded-full" alt="" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{user.displayName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <Button className="w-full h-11 text-lg font-semibold" onClick={handleJoin} disabled={joining}>
                    {joining ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Joining...
                      </>
                    ) : 'Accept & Join Workspace'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 gap-4">
               <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
               <p className="text-sm text-muted-foreground">Success! Redirecting...</p>
            </div>
          )}
          
          {(error || joined) && (
            <Button variant="ghost" className="w-full" onClick={() => router.push('/')}>
              {error ? 'Return to Home' : 'Click if not redirected'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}