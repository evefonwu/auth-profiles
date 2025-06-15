
-- Execute in Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";

DROP TABLE IF EXISTS profiles CASCADE;
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


