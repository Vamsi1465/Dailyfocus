import { useState, useEffect } from 'react';
import { TimeBlock, formatTime, getBlockIndicatorClass, BlockType } from '@/lib/schedule';
import { useCustomSchedule } from '@/hooks/useCustomSchedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Clock, ChevronLeft, Plus, Trash2, Edit2, GripVertical, X, Check, Search, Music, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/AppLayout';
import { useAlerts, SoundType } from '@/hooks/useAlerts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ClockPicker } from '@/components/ClockPicker';

export default function Settings() {
  const { schedule, updateBlock, addBlock, removeBlock, resetToDefault, isLoaded } = useCustomSchedule();
  const { soundType, changeSoundType } = useAlerts(null, null, false, false);
  
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  
  // Temporary state for the block being edited/created
  const [tempBlock, setTempBlock] = useState<Partial<TimeBlock>>({
      name: "",
      type: "agency",
      startHour: 9,
      startMinute: 0,
      endHour: 10,
      endMinute: 0,
      tasks: [],
      lockedCategories: []
  });
  
  // State for new task input in the edit mode
  const [newTaskInput, setNewTaskInput] = useState("");
  

  // State for popover control
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const startEditing = (block: TimeBlock) => {
    setEditingBlockId(block.id);
    setTempBlock({ ...block });
    setNewTaskInput("");
  };

  const resetToCreateMode = () => {
    setEditingBlockId(null);
    const now = new Date();
    const currentHour = now.getHours();
    setTempBlock({
        name: "",
        type: "agency",
        startHour: currentHour,
        startMinute: 0,
        endHour: (currentHour + 1) % 24,
        endMinute: 0,
        tasks: [],
        lockedCategories: []
    });
    setNewTaskInput("");
  };

  const saveBlock = () => {
    if (!tempBlock) return;

    // Validation
    const startHour = Number(tempBlock.startHour);
    const startMinute = Number(tempBlock.startMinute);
    const endHour = Number(tempBlock.endHour);
    const endMinute = Number(tempBlock.endMinute);

    if (
      isNaN(startHour) || isNaN(startMinute) || 
      isNaN(endHour) || isNaN(endMinute) ||
      startHour < 0 || startHour > 23 ||
      endHour < 0 || endHour > 23 ||
      startMinute < 0 || startMinute > 59 ||
      endMinute < 0 || endMinute > 59
    ) {
      toast({
        title: "Invalid time",
        description: "Please enter valid hours (0-23) and minutes (0-59)",
        variant: "destructive"
      });
      return;
    }

    if (!tempBlock.name?.trim()) {
        toast({
            title: "Invalid name",
            description: "Block must have a name",
            variant: "destructive"
        });
        return;
    }

    if (editingBlockId) {
        // Update existing
        updateBlock(editingBlockId, tempBlock);
        toast({
            title: "Block updated",
            description: "Changes saved successfully."
        });
    } else {
        // Create new
        const newBlock = {
            ...tempBlock,
            id: `block-${Date.now()}`,
            type: tempBlock.type || 'agency',
            tasks: tempBlock.tasks || [],
            lockedCategories: []
        } as TimeBlock;
        
        addBlock(newBlock);
        toast({
            title: "Block created",
            description: "New block added to your schedule."
        });
        // Reset to clean create mode for next entry
        resetToCreateMode();
    }
  };

  const handleDeleteBlock = (id: string) => {
    removeBlock(id);
    if (editingBlockId === id) {
        resetToCreateMode(); // Switch to create mode if deleted active block
    }
    toast({
        title: "Block deleted",
        description: "The block has been removed from your schedule."
    });
  };

  const addTaskToTemp = () => {
    if (!newTaskInput.trim()) return;
    setTempBlock(prev => ({
        ...prev,
        tasks: [...(prev.tasks || []), newTaskInput.trim()]
    }));
    setNewTaskInput("");
  };

  const removeTaskFromTemp = (index: number) => {
      setTempBlock(prev => ({
          ...prev,
          tasks: (prev.tasks || []).filter((_, i) => i !== index)
      }));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading schedule...</div>
      </div>
    );
  }

  // Derived state to check if we are in "Create Mode"
  const isCreating = editingBlockId === null;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background text-foreground pb-12">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

            {/* Header */}
            <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
                <div className="container max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <h1 className="font-semibold text-lg">Schedule Designer</h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50">
                             <Music className="w-3.5 h-3.5 text-muted-foreground" />
                             <Select value={soundType} onValueChange={(val: SoundType) => changeSoundType(val)}>
                                <SelectTrigger className="h-6 border-0 bg-transparent focus:ring-0 gap-2 text-xs font-medium w-[110px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beep">Standard Beep</SelectItem>
                                    <SelectItem value="chime">Soft Chime</SelectItem>
                                    <SelectItem value="electronic">Electronic Pulse</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container max-w-7xl mx-auto px-6 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-[calc(100vh-8rem)]">
                    
                    {/* Left Sidebar: Block List */}
                    <div className="lg:col-span-4 flex flex-col h-full gap-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Timeline</h2>
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">{schedule.length} Blocks</span>
                        </div>
                        
                        <Button 
                            onClick={resetToCreateMode} 
                            className={cn(
                                "w-full justify-start gap-3 h-12 text-base shadow-sm transition-all duration-300",
                                isCreating ? "ring-2 ring-primary ring-offset-2 bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
                            )}
                            variant={isCreating ? "default" : "outline"}
                        >
                            <div className="p-1 bg-background/20 rounded-md">
                                <Plus className="w-4 h-4" />
                            </div>
                            {isCreating ? "Designing New Block..." : "Create New Block"}
                        </Button>

                        <div className="px-1 py-2">
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    if (confirm("Reset schedule to default? This will overwrite your changes.")) {
                                        resetToDefault();
                                        toast({ title: "Schedule Reset", description: "Default schedule restored." });
                                    }
                                }}
                                className="w-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start h-8"
                            >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Restore Default Schedule
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 pb-4">
                            {schedule.map((block) => (
                                <div
                                    key={block.id}
                                    onClick={() => startEditing(block)}
                                    className={cn(
                                        "group flex items-center gap-3 p-3 rounded-xl border border-transparent transition-all duration-200 cursor-pointer",
                                        editingBlockId === block.id 
                                            ? "bg-primary/10 border-primary/20 shadow-sm" 
                                            : "hover:bg-card hover:border-border/50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-1 h-10 rounded-full transition-all duration-300",
                                        getBlockIndicatorClass(block.type),
                                        editingBlockId === block.id ? "scale-y-110" : "group-hover:scale-y-110"
                                    )} />
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className={cn("font-medium truncate text-sm", editingBlockId === block.id ? "text-primary" : "text-foreground")}>
                                                {block.name}
                                            </h3>
                                            <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                                {formatTime(block.startHour, block.startMinute)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span className="capitalize opacity-80">{block.type}</span>
                                            {block.tasks && block.tasks.length > 0 && (
                                                <span className="flex items-center gap-1 opacity-70">
                                                    {block.tasks.length} tasks
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Block?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete "{block.name}"?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteBlock(block.id);
                                                    }} className="bg-destructive text-destructive-foreground">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Editor (Always Visible) */}
                    <div className="lg:col-span-8 flex flex-col h-full">
                        <div className="flex-1 bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-xl p-8 animate-fade-in flex flex-col">
                            {/* Editor Header */}
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                <div>
                                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                        {isCreating ? 'Design New Block' : 'Edit Configuration'}
                                    </h2>
                                    <p className="text-muted-foreground mt-1">
                                        {isCreating 
                                            ? 'Configure a new focus session or routine.' 
                                            : `Modifying "${tempBlock.name || 'Block'}" settings.`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Action Buttons */}
                                    {editingBlockId && (
                                        <Button variant="ghost" onClick={resetToCreateMode} title="Cancel Edit & Create New">
                                            Cancel
                                        </Button>
                                    )}
                                    <Button onClick={saveBlock} className="gap-2 shadow-lg shadow-primary/20">
                                        <Check className="w-4 h-4" />
                                        {isCreating ? 'Create Block' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>

                            {/* Compact Editor Form */}
                            <div className="flex-1 overflow-hidden flex flex-col gap-5">
                                {/* Row 1: Quick Info */}
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-7 space-y-1.5">
                                        <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Block Name</Label>
                                        <Input 
                                            value={tempBlock.name || ''} 
                                            onChange={(e) => setTempBlock({...tempBlock, name: e.target.value})}
                                            placeholder="e.g. Deep Work"
                                            className="bg-black/20 border-white/5 focus:border-primary/50 font-medium text-zinc-200 placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <div className="col-span-5 space-y-1.5">
                                        <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Tag</Label>
                                        <div className="flex gap-2">
                                            <div className={cn("w-1.5 h-auto rounded-full my-1", getBlockIndicatorClass(tempBlock.type || 'agency'))} />
                                            <Input 
                                                value={tempBlock.type || ''} 
                                                onChange={(e) => setTempBlock({...tempBlock, type: e.target.value})}
                                                placeholder="Category"
                                                className="bg-black/20 border-white/5 focus:border-primary/50 text-zinc-300 placeholder:text-zinc-600 px-3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Timing (Analog Clock Picker) */}
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Time Window</Label>
                                    <div className="flex items-center gap-4 bg-black/20 border border-white/5 rounded-lg p-2 px-3 relative z-20">
                                        {/* Start Time Picker */}
                                        <Popover open={startOpen} onOpenChange={setStartOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" className="h-auto p-1.5 hover:bg-white/10 rounded-md group">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
                                                        <div className="text-lg font-mono font-medium text-zinc-200 group-hover:text-white transition-colors">
                                                            {formatTime(tempBlock.startHour || 0, tempBlock.startMinute || 0)}
                                                        </div>
                                                    </div>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none" align="start" side="bottom" sideOffset={10} avoidCollisions={false}>
                                                <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden mt-2">
                                                    <ClockPicker 
                                                        initialHour={tempBlock.startHour} 
                                                        initialMinute={tempBlock.startMinute}
                                                        onChange={(h, m) => setTempBlock({...tempBlock, startHour: h, startMinute: m})}
                                                        onClose={() => setStartOpen(false)}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        {/* Arrow */}
                                        <div className="flex-1 flex items-center justify-center opacity-30">
                                            <div className="h-px bg-white/20 w-full" />
                                            <ChevronLeft className="w-3 h-3 text-white rotate-180 mx-2" />
                                            <div className="h-px bg-white/20 w-full" />
                                        </div>

                                        {/* End Time Picker */}
                                        <Popover open={endOpen} onOpenChange={setEndOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" className="h-auto p-1.5 hover:bg-white/10 rounded-md group">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-lg font-mono font-medium text-zinc-200 group-hover:text-white transition-colors">
                                                            {formatTime(tempBlock.endHour || 0, tempBlock.endMinute || 0)}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider group-hover:text-zinc-400">End</span>
                                                    </div>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none" align="end" side="bottom" sideOffset={10} avoidCollisions={false}>
                                               <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden mt-2">
                                                    <ClockPicker 
                                                        initialHour={tempBlock.endHour} 
                                                        initialMinute={tempBlock.endMinute}
                                                        onChange={(h, m) => setTempBlock({...tempBlock, endHour: h, endMinute: m})}
                                                        onClose={() => setEndOpen(false)}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Row 3: Checklist (Premium Style) */}
                                <div className="space-y-1.5 flex flex-col min-h-0">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Checklist</Label>
                                        <span className="text-[10px] text-zinc-600">{tempBlock.tasks?.length || 0} items</span>
                                    </div>
                                    
                                    <div className="bg-black/20 rounded-lg border border-white/5 flex flex-col h-[180px] overflow-hidden"> 
                                        {/* Task List */}
                                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                            {tempBlock.tasks?.map((task, idx) => (
                                                <div key={idx} className="group flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 rounded-md transition-all duration-200">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary shadow-sm transition-colors" />
                                                    <span className="text-xs text-zinc-300 group-hover:text-white flex-1 truncate font-medium">{task}</span>
                                                    <button 
                                                        onClick={() => removeTaskFromTemp(idx)}
                                                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 p-1 rounded-md transition-all transform scale-90 group-hover:scale-100"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!tempBlock.tasks || tempBlock.tasks.length === 0) && (
                                                <div className="flex flex-col items-center justify-center h-full text-zinc-700 space-y-2">
                                                    <div className="p-2 bg-white/5 rounded-full">
                                                        <Search className="w-4 h-4 text-zinc-800" />
                                                    </div>
                                                    <p className="text-[10px] font-medium uppercase tracking-wider">No Tasks Added</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Add Input */}
                                        <div className="p-2 border-t border-white/5 bg-white/[0.02]">
                                            <div className="flex gap-2 relative group-focus-within:ring-1 ring-primary/20 rounded-md transition-all">
                                                <Input 
                                                    placeholder="Add new task..." 
                                                    value={newTaskInput}
                                                    onChange={(e) => setNewTaskInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addTaskToTemp()}
                                                    className="h-8 bg-black/40 border-0 focus:ring-0 text-xs pl-8 placeholder:text-zinc-600"
                                                />
                                                <Plus className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                                                <Button size="sm" variant="ghost" onClick={addTaskToTemp} disabled={!newTaskInput.trim()} className="h-8 w-8 p-0 text-zinc-400 hover:text-primary">
                                                    <ChevronLeft className="w-4 h-4 rotate-180" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
      </div>
    </AppLayout>
  );
}
