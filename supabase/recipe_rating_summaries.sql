-- Run once in Supabase SQL Editor before publishing the matching website PR.
-- This exposes only aggregate, non-zero recipe-rating summaries to the browser.
-- It does not expose individual votes, voter IDs, or any direct table access.

create or replace function public.recipe_rating_summaries(p_recipe_slugs text[])
returns table (
  recipe_slug text,
  rating_count bigint,
  average_rating numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    rr.recipe_slug,
    count(*)::bigint as rating_count,
    round(avg(rr.rating)::numeric, 1) as average_rating
  from public.recipe_ratings as rr
  where rr.recipe_slug = any(p_recipe_slugs)
  group by rr.recipe_slug
  having count(*) > 0;
$$;

revoke all on function public.recipe_rating_summaries(text[]) from public;
grant execute on function public.recipe_rating_summaries(text[]) to anon, authenticated;
