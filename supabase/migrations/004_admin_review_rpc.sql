create or replace function public.admin_review_pin(
  p_pin_id uuid,
  p_action text,
  p_reason text,
  p_admin_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_status text;
  v_updated_pin record;
begin
  if p_action not in ('approve', 'reject') then
    return jsonb_build_object('error', 'invalid_action');
  end if;

  if p_action = 'reject' and (p_reason is null or trim(p_reason) = '') then
    return jsonb_build_object('error', 'reason_required');
  end if;

  v_status := case when p_action = 'approve' then 'approved' else 'rejected' end;

  update public.pins
  set
    status = v_status,
    reviewed_by = p_admin_id,
    reviewed_at = now(),
    rejection_reason = case when p_action = 'reject' then p_reason else null end
  where id = p_pin_id
  returning * into v_updated_pin;

  if not found then
    return jsonb_build_object('error', 'pin_not_found');
  end if;

  insert into public.pin_moderation_events (pin_id, actor_user_id, event_type, reason)
  values (p_pin_id, p_admin_id, v_status, case when p_action = 'reject' then p_reason else null end);

  return jsonb_build_object('pin', row_to_json(v_updated_pin));
end;
$$;
