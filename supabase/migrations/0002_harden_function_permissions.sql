-- Restrict internal SECURITY DEFINER helpers to trigger/database execution only.
-- The functions are not application RPC endpoints and must not be callable by API roles.
revoke execute on function public.activate_membership_after_payment() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon, authenticated;
