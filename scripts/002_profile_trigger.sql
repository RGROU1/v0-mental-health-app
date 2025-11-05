-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create profile
  insert into public.profiles (id, display_name, age, gender)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', 'User'),
    (new.raw_user_meta_data ->> 'age')::integer,
    new.raw_user_meta_data ->> 'gender'
  )
  on conflict (id) do nothing;

  -- Initialize user coins
  insert into public.user_coins (user_id, total_coins, current_balance)
  values (new.id, 0, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
