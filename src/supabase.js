import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://umvgzitfydwzpxznchfb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmd6aXRmeWR3enB4em5jaGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDk3NDcsImV4cCI6MjA4OTY4NTc0N30.23iUd-dqNB4HbLWC3jCgY_ByqG-Nd4Z-zEXyoxOXivc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
