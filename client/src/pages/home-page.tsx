import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import TaskList from "@/components/task-list";
import TaskForm from "@/components/task-form";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Your Tasks</h2>
          <Button onClick={() => setIsNewTaskOpen(true)}>
            Add New Task
          </Button>
        </div>

        <TaskList />

        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              onSuccess={() => setIsNewTaskOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
