-- Seed initial achievements
insert into public.achievements (name, description, icon, coins_reward) values
  ('First Check-In', 'Complete your first daily check-in', '🎯', 50),
  ('Week Warrior', 'Complete check-ins for 7 consecutive days', '🔥', 200),
  ('Month Master', 'Complete check-ins for 30 consecutive days', '👑', 500),
  ('Medication Adherence', 'Take all medications for 7 days straight', '💊', 150),
  ('Sleep Champion', 'Log 8+ hours of sleep for 5 days', '😴', 100),
  ('Mood Tracker', 'Log your mood for 14 consecutive days', '😊', 250),
  ('Game Master', 'Play 10 mini-games', '🎮', 300),
  ('Coin Collector', 'Earn 1000 total coins', '💰', 100)
on conflict (name) do nothing;
