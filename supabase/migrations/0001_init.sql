-- Fito: khởi tạo DB. Chạy 1 lần trong Supabase → SQL Editor.
create table public.allowed_users (
  email text primary key check (email = lower(email)),
  display_name text not null,
  avatar_letter text not null check (char_length(avatar_letter) = 1)
);
create table public.imdb_ratings (
  tconst text primary key,
  rating numeric(3,1) not null,
  votes integer not null,
  updated_at timestamptz not null default now()
);
create table public.movie_cache (
  tmdb_id integer primary key,
  imdb_id text, title_vi text, title_en text, year smallint, runtime smallint,
  genres text[] not null default '{}',
  poster_path text, backdrop_path text, trailer_key text,
  providers_vn jsonb, scores jsonb, score_total numeric(3,1),
  tmdb_fetched_at timestamptz, omdb_fetched_at timestamptz, trakt_fetched_at timestamptz
);
create table public.swipes (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tmdb_id integer not null,
  decision text not null check (decision in ('want','skip')),
  created_at timestamptz not null default now(),
  primary key (user_id, tmdb_id)
);
create view public.matches with (security_invoker = true) as
  select tmdb_id, max(created_at) as matched_at
  from public.swipes where decision = 'want'
  group by tmdb_id having count(distinct user_id) >= 2;
create table public.watch_log (
  id bigint generated always as identity primary key,
  tmdb_id integer not null,
  watched_on date not null default current_date,
  place text not null check (place in ('cinema','home')),   -- PLAN ghi "where" (từ khoá SQL) → đổi tên thành place
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  my_score smallint check (my_score between 1 and 10),
  note text,
  created_at timestamptz not null default now()
);

-- Ai đang đăng nhập có nằm trong allowed_users không
create or replace function public.is_allowed() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.allowed_users a where a.email = lower(auth.jwt() ->> 'email'));
$$;

-- Trang /login hỏi trước để báo lỗi rõ (chấp nhận lộ "email này có được phép không", app riêng 2 người)
create or replace function public.is_email_allowed(p_email text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.allowed_users a where a.email = lower(trim(p_email)));
$$;
grant execute on function public.is_email_allowed(text) to anon, authenticated;

-- Chặn tạo tài khoản với email ngoài danh sách
create or replace function public.block_unknown_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.allowed_users where email = lower(new.email)) then
    raise exception 'Email này không được phép dùng Fito';
  end if;
  return new;
end $$;
create trigger block_unknown_signup before insert on auth.users
  for each row execute function public.block_unknown_signup();

-- RLS
alter table public.allowed_users enable row level security;
alter table public.imdb_ratings enable row level security;
alter table public.movie_cache enable row level security;
alter table public.swipes enable row level security;
alter table public.watch_log enable row level security;

create policy "hai đứa đọc" on public.allowed_users for select to authenticated using ((select public.is_allowed()));
create policy "đăng nhập là đọc" on public.imdb_ratings for select to authenticated using (true);
create policy "đăng nhập là đọc" on public.movie_cache for select to authenticated using (true);

create policy "hai đứa đọc" on public.swipes for select to authenticated using ((select public.is_allowed()));
create policy "tự ghi của mình" on public.swipes for insert to authenticated with check ((select public.is_allowed()) and user_id = (select auth.uid()));
create policy "tự sửa của mình" on public.swipes for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "tự xoá của mình" on public.swipes for delete to authenticated using (user_id = (select auth.uid()));

create policy "hai đứa đọc" on public.watch_log for select to authenticated using ((select public.is_allowed()));
create policy "tự ghi của mình" on public.watch_log for insert to authenticated with check ((select public.is_allowed()) and user_id = (select auth.uid()));
create policy "tự sửa của mình" on public.watch_log for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "tự xoá của mình" on public.watch_log for delete to authenticated using (user_id = (select auth.uid()));
-- movie_cache, imdb_ratings: ghi bằng service role (bỏ qua RLS), không có policy ghi.

grant select on public.allowed_users, public.imdb_ratings, public.movie_cache, public.matches to authenticated;
grant select, insert, update, delete on public.swipes, public.watch_log to authenticated;
grant all on public.imdb_ratings, public.movie_cache to service_role;

alter publication supabase_realtime add table public.swipes;

-- Bước tiếp: thêm 2 email (sửa rồi chạy)
-- insert into public.allowed_users (email, display_name, avatar_letter) values
--   ('ban1@example.com', 'Tên 1', 'A'),
--   ('ban2@example.com', 'Tên 2', 'B');
