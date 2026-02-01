import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useGoals, Goal } from '@/hooks/useGoals';
import { Plus, Trash2, CalendarDays, Trophy, Loader2, Sparkles, Edit2 } from 'lucide-react';

export default function MonthlyGoals() {
  const { goals, loading, addGoal, toggleGoal, deleteGoal, updateGoal, currentPeriod } = useGoals('monthly');
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

  // Format Month Name
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <AppLayout>
      <div className="container max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500">
                    Monthly Vision
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span className="font-medium">{monthName}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-lg shadow-sm w-full md:w-auto">
                <Input 
                    placeholder="Add a monthly target..." 
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="border-none shadow-none focus-visible:ring-0 w-full md:w-80"
                />
                <Button size="icon" onClick={handleAdd} disabled={!newGoal.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="w-5 h-5" />
                </Button>
            </div>
        </header>

        <div className="grid gap-6">
            {/* North Star / Progress */}
            <Card className="border-purple-500/20 bg-purple-500/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Trophy className="w-32 h-32 text-purple-500" />
                </div>
                <CardContent className="p-6 relative z-10">
                    <div className="flex justify-between items-end mb-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium">
                                <Sparkles className="w-4 h-4" />
                                <span>Monthly Progress</span>
                            </div>
                            <h2 className="text-3xl font-bold">{Math.round(progress)}% Achieved</h2>
                        </div>
                    </div>
                    <Progress value={progress} className="h-4" indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-600" />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-1 gap-6">
                <Card className="min-h-[400px]">
                    <CardHeader>
                        <CardTitle>Milestones</CardTitle>
                        <CardDescription>Big picture goals to accomplish this month.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center p-8 text-muted-foreground">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading vision...
                            </div>
                        ) : goals.length === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed border-muted rounded-xl">
                                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <p className="text-muted-foreground font-medium text-lg">Define your month.</p>
                                <p className="text-muted-foreground">What is the one thing that matters most?</p>
                            </div>
                        ) : (
                            goals.map(goal => (
                                <div 
                                    key={goal.id} 
                                    className={`
                                        flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group
                                        ${goal.completed 
                                            ? 'bg-secondary/30 border-transparent opacity-75' 
                                            : 'bg-card border-border hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5'
                                        }
                                    `}
                                >
                                    <Checkbox 
                                        checked={goal.completed} 
                                        onCheckedChange={(checked) => toggleGoal(goal.id, checked as boolean)}
                                        className="w-6 h-6 border-2 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 rounded-full"
                                    />
                                    
                                    {editingId === goal.id ? (
                                        <div className="flex-1 flex gap-2">
                                            <Input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="h-9 text-lg"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveEdit(goal.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                            <Button size="sm" onClick={() => handleSaveEdit(goal.id)}>Save</Button>
                                        </div>
                                    ) : (
                                        <span className={`flex-1 text-lg ${goal.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                                            {goal.title}
                                        </span>
                                    )}

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
      </div>
    </AppLayout>
  );
}
