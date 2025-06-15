-- Enable Row Level Security

-- Drop existing policies if they exist
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;
drop policy if exists "Users can delete own profile." on profiles;

-- Enable RLS on profiles table 
alter table profiles enable row level security;

-- Add policies 
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

create policy "Users can delete own profile." on profiles
  for delete using (auth.uid() = id);


