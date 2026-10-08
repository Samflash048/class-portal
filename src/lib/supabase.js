import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kmqcaktheoxphkgbmems.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttcWNha3RoZW94cGhrZ2JtZW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNjQyMTIsImV4cCI6MjEwNjk0MDIxMn0.EF-XDnOjEHXvhfSpxs4aDoXK93FyMTlPYnPKmbx4esw'

export const supabase = createClient(supabaseUrl, supabaseKey)