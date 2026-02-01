import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 z-50">
        <Sidebar className="h-full" />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 relative flex flex-col min-h-screen">
        
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm p-4 flex md:hidden items-center gap-4">
             <Sheet>
                 <SheetTrigger asChild>
                     <Button variant="ghost" size="icon">
                         <Menu className="w-5 h-5" />
                     </Button>
                 </SheetTrigger>
                 <SheetContent side="left" className="p-0 w-72">
                     <Sidebar className="border-none w-full" />
                 </SheetContent>
             </Sheet>

             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">FF</span>
                </div>
                <span className="font-bold tracking-tight">FocusFlow</span>
             </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
            {children}
        </main>
      </div>
    </div>
  );
}
