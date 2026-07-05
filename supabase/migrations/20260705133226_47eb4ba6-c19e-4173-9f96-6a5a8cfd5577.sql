REVOKE EXECUTE ON FUNCTION public.request_member_change(text, text, text, jsonb, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.request_member_change(text, text, text, jsonb, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.request_member_change(text, text, text, jsonb, integer) FROM authenticated;