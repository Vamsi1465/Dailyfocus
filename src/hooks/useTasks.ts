import { useState, useCallback, useEffect } from 'react';

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  note: string;
  isCustom: boolean;
}

interface TasksState {
  [blockId: string]: TaskItem[];
}

const STORAGE_KEY = 'daily-execution-tasks';

export function useTasks(blockId: string, defaultTasks: string[]) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const allTasks: TasksState = JSON.parse(stored);
        if (allTasks[blockId]) {
          // Merge with default tasks to ensure new defaults are added
          const storedTasks = allTasks[blockId];
          const defaultTaskItems = defaultTasks.map((text, index) => ({
            id: `${blockId}-default-${index}`,
            text,
            completed: false,
            note: '',
            isCustom: false
          }));
          
          // Keep custom tasks and update default ones
          const customTasks = storedTasks.filter(t => t.isCustom);
          const mergedDefaults = defaultTaskItems.map(defaultTask => {
            const existing = storedTasks.find(t => !t.isCustom && t.text === defaultTask.text);
            return existing ? { ...defaultTask, completed: existing.completed, note: existing.note } : defaultTask;
          });
          
          setTasks([...mergedDefaults, ...customTasks]);
          return;
        }
      } catch (e) {
        console.error('Error loading tasks', e);
      }
    }
    
    // Initialize with default tasks
    setTasks(defaultTasks.map((text, index) => ({
      id: `${blockId}-default-${index}`,
      text,
      completed: false,
      note: '',
      isCustom: false
    })));
  }, [blockId, defaultTasks]);

  // Save tasks to localStorage
  const saveTasks = useCallback((newTasks: TaskItem[]) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let allTasks: TasksState = {};
    
    if (stored) {
      try {
        allTasks = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing tasks', e);
      }
    }
    
    allTasks[blockId] = newTasks;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks));
  }, [blockId]);

  const toggleTask = useCallback((taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      saveTasks(updated);
      return updated;
    });
  }, [saveTasks]);

  const updateNote = useCallback((taskId: string, note: string) => {
    setTasks(prev => {
      const updated = prev.map(task =>
        task.id === taskId ? { ...task, note } : task
      );
      saveTasks(updated);
      return updated;
    });
  }, [saveTasks]);

  const addTask = useCallback((text: string) => {
    if (!text.trim()) return;
    
    const newTask: TaskItem = {
      id: `${blockId}-custom-${Date.now()}`,
      text: text.trim(),
      completed: false,
      note: '',
      isCustom: true
    };
    
    setTasks(prev => {
      const updated = [...prev, newTask];
      saveTasks(updated);
      return updated;
    });
  }, [blockId, saveTasks]);

  const editTask = useCallback((taskId: string, text: string) => {
    setTasks(prev => {
      const updated = prev.map(task =>
        task.id === taskId ? { ...task, text } : task
      );
      saveTasks(updated);
      return updated;
    });
  }, [saveTasks]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => {
      // Allow deleting any task
      const updated = prev.filter(t => t.id !== taskId);
      saveTasks(updated);
      return updated;
    });
  }, [saveTasks]);

  return {
    tasks,
    toggleTask,
    updateNote,
    addTask,
    editTask,
    deleteTask
  };
}
