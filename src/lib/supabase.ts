import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxigqxvumvawndogebfa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aWdxeHZ1bXZhd25kb2dlYmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjI3MzgsImV4cCI6MjA4NTUzODczOH0.0i8VOijjPTJ8WVycCdEHIRfP2bETPloNhw-7NSGp0fk';

export const supabase = createClient(supabaseUrl, supabaseKey);
