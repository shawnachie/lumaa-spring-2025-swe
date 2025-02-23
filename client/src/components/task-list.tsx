import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Task, UpdateTask, updateTaskSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskList() {
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/tasks"],
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTask }) => {
      const res = await apiRequest("PUT", `/tasks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      setEditingTask(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CardTitle className="text-2xl font-semibold mb-2">
            No tasks yet
          </CardTitle>
          <CardDescription>
            Create your first task to get started!
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className={task.isComplete ? "opacity-75" : ""}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex items-start gap-2">
              <Checkbox
                checked={task.isComplete}
                onCheckedChange={(checked) =>
                  updateTask.mutate({
                    id: task.id,
                    data: { isComplete: checked === true },
                  })
                }
                disabled={updateTask.isPending}
                className="mt-1"
              />
              <div>
                <CardTitle className={task.isComplete ? "line-through" : ""}>
                  {task.title}
                </CardTitle>
                {task.description && (
                  <CardDescription className="mt-1">
                    {task.description}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingTask(task)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTask.mutate(task.id)}
                disabled={deleteTask.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}

      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <EditTaskForm
              task={editingTask}
              onSubmit={(data) =>
                updateTask.mutate({ id: editingTask.id, data })
              }
              isLoading={updateTask.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditTaskForm({
  task,
  onSubmit,
  isLoading,
}: {
  task: Task;
  onSubmit: (data: UpdateTask) => void;
  isLoading: boolean;
}) {
  const form = useForm<UpdateTask>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}