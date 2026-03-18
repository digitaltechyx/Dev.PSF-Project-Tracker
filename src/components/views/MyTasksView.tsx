"use client";

import React, { useState } from 'react';
import { TaskList } from '../tasks/TaskList';
import { TaskDetailPanel } from '../tasks/TaskDetailPanel';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ListTodo, CheckSquare } from 'lucide-react';

export function MyTasksView({ store }: { store: any }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const myTasks = store.myTasks;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ListTodo className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-headline">My Tasks</h2>
            <p className="text-sm text-muted-foreground">Everything assigned to you across all projects.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTasks.filter((t: any) => t.status === 'todo').length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTasks.filter((t: any) => t.status === 'in_progress').length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTasks.filter((t: any) => t.status === 'done').length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-xl border-none shadow-sm">
        <TaskList 
          tasks={myTasks} 
          onTaskClick={(id) => setSelectedTaskId(id)} 
          updateTask={store.updateTask}
        />
      </div>

      {selectedTaskId && (
        <TaskDetailPanel 
          taskId={selectedTaskId} 
          isOpen={!!selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
          store={store}
        />
      )}

      {myTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
            <CheckSquare className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">No tasks assigned to you</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Sit back and relax, or check with your team if there's anything you can help with!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
