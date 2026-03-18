"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, MessageSquare, CheckCircle2, Clock, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockNotifications = [
  {
    id: 'n1',
    type: 'comment',
    user: { name: 'Jordan Smith', avatar: 'https://picsum.photos/seed/u2/100/100' },
    message: 'commented on "Mobile App Redesign"',
    content: 'The new color palette looks great! Can we check the contrast for accessibility?',
    time: '2 hours ago',
    read: false,
    icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
  },
  {
    id: 'n2',
    type: 'status',
    user: { name: 'Sarah Chen', avatar: 'https://picsum.photos/seed/u3/100/100' },
    message: 'completed "User testing setup"',
    time: '5 hours ago',
    read: true,
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  },
  {
    id: 'n3',
    type: 'assignment',
    user: { name: 'Alex Rivera', avatar: 'https://picsum.photos/seed/u1/100/100' },
    message: 'assigned you to "Finalize navigation patterns"',
    time: 'Yesterday',
    read: true,
    icon: <Clock className="h-4 w-4 text-orange-500" />,
  },
  {
    id: 'n4',
    type: 'invite',
    user: { name: 'Jordan Smith', avatar: 'https://picsum.photos/seed/u2/100/100' },
    message: 'added you to "Marketing Ops" workspace',
    time: '2 days ago',
    read: true,
    icon: <UserPlus className="h-4 w-4 text-purple-500" />,
  },
];

export function NotificationsView({ store }: { store: any }) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold font-headline">Notifications</h2>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y">
            {mockNotifications.map((notif) => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-6 flex items-start gap-4 transition-colors hover:bg-muted/30",
                  !notif.read && "bg-primary/5 border-l-4 border-l-primary"
                )}
              >
                <Avatar className="h-10 w-10 mt-1">
                  <AvatarImage src={notif.user.avatar} />
                  <AvatarFallback>{notif.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{notif.user.name}</span>
                    <span className="text-sm text-muted-foreground">{notif.message}</span>
                  </div>
                  
                  {notif.content && (
                    <div className="bg-muted/50 p-3 rounded-lg text-sm italic text-muted-foreground border mt-2">
                      "{notif.content}"
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {notif.icon}
                      <span className="capitalize">{notif.type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground/60">• {notif.time}</span>
                  </div>
                </div>

                {!notif.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center py-6">
        <button className="text-sm text-primary font-medium hover:underline">
          View all history
        </button>
      </div>
    </div>
  );
}
