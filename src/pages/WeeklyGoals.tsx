import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useGoals, Goal } from '@/hooks/useGoals';
import { Plus, Trash2, Calendar, Target, Loader2, CheckCircle2, Edit2 } from 'lucide-react';

export default function WeeklyGoals() {
  const { goals, loading, addGoal, toggleGoal, deleteGoal, updateGoal, currentPeriod } = useGoals('weekly');
  const [newGoal, setNewGoal] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEditing = (goal: Goal) => {
      setEditingId(goal.id);
      setEditValue(goal.title);
  };

  const handleSaveEdit = (id: string) => {
      if (editValue.trim()) {
          updateGoal(id, editValue);
      }
      setEditingId(null);
  };

  const handleAdd = () => {
    if (!newGoal.trim()) return;
    addGoal(newGoal);
    setNewGoal('');
  };

  const completedCount = goals.filter(g => g.completed).length;
  const progress = goals.length > 0 ? (completedCount / goals.length) * 100 : 0;

  // Calculate days left in week (Assuming Sunday is last day)
  const today = new Date();
  const daysLeft = 7 - today.getDay(); 

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500">
                    Weekly Focus
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Period: {currentPeriod}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                        {daysLeft} days left
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-lg shadow-sm w-full md:w-auto">
                <Input 
                    placeholder="Add a new goal..." 
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="border-none shadow-none focus-visible:ring-0 w-full md:w-64"
                />
                <Button size="icon" onClick={handleAdd} disabled={!newGoal.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <Plus className="w-5 h-5" />
                </Button>
            </div>
        </header>

        <div className="grid gap-6">
            {/* Progress Card */}
            <Card className="border-cyan-500/20 bg-cyan-500/5">
                <CardContent className="p-6">
                    <div className="flex justify-between items-end mb-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Weekly Progress</p>
                            <h2 className="text-2xl font-bold">{Math.round(progress)}% Complete</h2>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold text-foreground">{completedCount}</span>
                            <span className="text-muted-foreground text-sm">/{goals.length} Goals</span>
                        </div>
                    </div>
                    <Progress value={progress} className="h-3" indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-500" />
                </CardContent>
            </Card>

            {/* Goals List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-cyan-500" />
                        Your Objectives
                    </CardTitle>
                    <CardDescription>Check off items as you complete them.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {loading ? (
                        <div className="flex justify-center p-8 text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading goals...
                        </div>
                    ) : goals.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl bg-muted/20">
                            <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <p className="text-muted-foreground font-medium">No goals set for this week.</p>
                        </div>
                    ) : (
                        goals.map(goal => (
                            <div 
                                key={goal.id} 
                                className={`
                                    flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group
                                    ${goal.completed 
                                        ? 'bg-secondary/30 border-transparent' 
                                        : 'bg-card border-border hover:border-cyan-500/50 hover:shadow-md'
                                    }
                                `}
                            >
                                <Checkbox 
                                    checked={goal.completed} 
                                    onCheckedChange={(checked) => toggleGoal(goal.id, checked as boolean)}
                                    className="w-5 h-5 border-2 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                                />
                                
                                {editingId === goal.id ? (
                                    <div className="flex-1 flex gap-2">
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="h-8"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEdit(goal.id);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                        />
                                        <Button size="sm" onClick={() => handleSaveEdit(goal.id)}>Save</Button>
                                    </div>
                                ) : (
                                    <span className={`flex-1 text-base ${goal.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                                        {goal.title}
                                    </span>
                                )}

                                {goal.completed && editingId !== goal.id && <CheckCircle2 className="w-5 h-5 text-cyan-500 animate-in zoom-in spin-in-12" />}
                                
                                {editingId !== goal.id && (
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-muted-foreground hover:text-primary"
                                            onClick={() => startEditing(goal)}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => {
                                                if (window.confirm('Delete this goal?')) {
                                                    deleteGoal(goal.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
