import { useTasks } from '@/hooks/useTasks';
import { TimeBlock, isBlockLocked } from '@/lib/schedule';
import { Check, Lock, MessageSquare, RotateCcw, Plus, Trash2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface TaskListProps {
  block: TimeBlock;
  currentBlock: TimeBlock | null;
}

export function TaskList({ block, currentBlock }: TaskListProps) {
  const { tasks, toggleTask, updateNote, addTask, deleteTask, editTask } = useTasks(block.id, block.tasks);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState("");
  
  const [newTaskText, setNewTaskText] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const isLocked = isBlockLocked(currentBlock, block.type);

  if (isLocked) {
    return (
      <div className="block-locked">
        <div className="flex items-center gap-3 p-6 bg-muted/50 rounded-xl border border-border">
          <Lock className="w-5 h-5 text-muted-foreground" />
          <p className="text-muted-foreground">
            This section is locked during {currentBlock?.name || 'this time block'}.
          </p>
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask(newTaskText);
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const startEditing = (id: string, text: string) => {
      setEditingTaskId(id);
      setEditTaskText(text);
  };

  const handleSaveEdit = (id: string) => {
      if (editTaskText.trim()) {
          editTask(id, editTaskText);
      }
      setEditingTaskId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    } else if (e.key === 'Escape') {
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">Tasks</h3>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{tasks.length} done
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Add new task input */}
      {isAddingTask && (
        <div className="flex gap-2 animate-fade-in">
          <Input
            placeholder="Enter a new task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1"
            maxLength={200}
          />
          <Button onClick={handleAddTask} disabled={!newTaskText.trim()}>
            Add
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => {
              setNewTaskText('');
              setIsAddingTask(false);
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "rounded-lg border border-border transition-all duration-200 group",
              task.completed ? "bg-muted/30" : "bg-card",
              task.isCustom && "border-primary/30"
            )}
          >
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              onClick={() => toggleTask(task.id)}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0",
                  task.completed
                    ? "bg-primary border-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              
                <span
                  className={cn(
                    "flex-1 transition-all",
                    task.completed && "line-through text-muted-foreground"
                  )}
                >
                  {task.id === editingTaskId ? (
                      <Input 
                        value={editTaskText}
                        onChange={(e) => setEditTaskText(e.target.value)}
                        autoFocus
                        className="h-7 text-sm"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(task.id);
                            if (e.key === 'Escape') setEditingTaskId(null);
                        }}
                      />
                  ) : (
                      <>
                        {task.text}
                        {task.isCustom && (
                        <span className="ml-2 text-xs text-primary/60 font-medium hidden group-hover:inline-block">custom</span>
                        )}
                      </>
                  )}
                </span>

              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {task.id === editingTaskId ? (
                    <Button
                        size="sm"
                        className="h-7 px-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(task.id);
                        }}
                    >
                        Save
                    </Button>
                ) : (
                    <>
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            startEditing(task.id, task.text);
                        }}
                        >
                        <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this task?')) {
                                deleteTask(task.id);
                            }
                            }}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
                  }}
                >
                  <MessageSquare className={cn(
                    "w-3 h-3",
                    task.note ? "text-primary" : "text-muted-foreground"
                  )} />
                </Button>
              </div>
            </div>

            {expandedTaskId === task.id && (
              <div className="px-4 pb-4">
                <Textarea
                  placeholder="Add a note..."
                  value={task.note}
                  onChange={(e) => updateNote(task.id, e.target.value)}
                  className="min-h-[80px] bg-background"
                  onClick={(e) => e.stopPropagation()}
                  maxLength={500}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tasks yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
}
