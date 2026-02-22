create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

create user authenticator noinherit password 'authenticator';
grant anon to authenticator;
grant authenticated to authenticator;
grant service_role to authenticator;

create user supabase_admin login password 'postgres' superuser;
grant all privileges on database postgres to supabase_admin;

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

create table if not exists public.status_checks (
	id bigserial primary key,
	name text not null unique,
	message text not null,
	updated_at timestamptz not null default now()
);

insert into public.status_checks (name, message)
values ('default', 'Supabase table is reachable')
on conflict (name)
do update set
	message = excluded.message,
	updated_at = now();
