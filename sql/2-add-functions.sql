
-- Create Database Functions

-- Drop existing triggers and functions if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists update_profiles_updated_at on profiles;
drop function if exists public.handle_new_user();
drop function if exists public.update_updated_at_column();

-- Function to handle profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to automatically update updated_at column whenever any row in profiles is modified
create trigger update_profiles_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();