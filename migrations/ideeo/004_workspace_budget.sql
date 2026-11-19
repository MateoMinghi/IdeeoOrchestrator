SET LOCAL ROLE ideeo_owner;
ALTER TABLE ideeo.schema_version DROP CONSTRAINT schema_version_version_check;
ALTER TABLE ideeo.schema_version ADD CHECK (version BETWEEN 1 AND 4);
UPDATE ideeo.schema_version SET version=4;
ALTER TABLE ideeo.inference_operations ADD COLUMN profile text NOT NULL DEFAULT 'constrained' CHECK (profile IN ('constrained','workspace'));
CREATE OR REPLACE FUNCTION ideeo.reserve_inference(s jsonb,k text,c uuid,f text,kind_requested text)
RETURNS TABLE(code text,attempt_id uuid,deadline timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,ideeo AS $$
DECLARE op ideeo.inference_operations; used integer; today date := (clock_timestamp() AT TIME ZONE 'UTC')::date;
BEGIN
  IF s IS DISTINCT FROM nullif(current_setting('ideeo.caller',true),'')::jsonb OR NOT ideeo.valid_scope(s)
    OR kind_requested NOT IN ('model','tool') THEN RAISE EXCEPTION 'invalid inference caller'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(s::text || k,61));
  IF NOT EXISTS(SELECT 1 FROM ideeo.conversations WHERE scope=s AND id=c AND expires_at>clock_timestamp()) THEN
    RETURN QUERY SELECT 'conversation_expired'::text,NULL::uuid,NULL::timestamptz; RETURN;
  END IF;
  INSERT INTO ideeo.inference_operations(scope,request_key,conversation_id,fingerprint,deadline_at) VALUES(s,k,c,f,clock_timestamp()+interval '15 seconds') ON CONFLICT DO NOTHING;
  SELECT * INTO op FROM ideeo.inference_operations WHERE scope=s AND request_key=k;
  IF op.profile<>'constrained' THEN RETURN QUERY SELECT 'inference_profile_mismatch'::text,NULL::uuid,op.deadline_at; RETURN; END IF;
  IF op.conversation_id<>c OR op.fingerprint<>f THEN
    RETURN QUERY SELECT 'idempotency_conflict'::text,NULL::uuid,NULL::timestamptz; RETURN;
  END IF;
  IF op.deadline_at<=clock_timestamp() THEN
    RETURN QUERY SELECT 'inference_expired'::text,NULL::uuid,op.deadline_at; RETURN;
  END IF;
  SELECT count(*) INTO used FROM ideeo.inference_attempts WHERE scope=s AND request_key=k AND kind=kind_requested;
  IF used >= (CASE WHEN kind_requested='model' THEN 3 ELSE 2 END) THEN
    RETURN QUERY SELECT 'inference_budget_exhausted'::text,NULL::uuid,op.deadline_at; RETURN;
  END IF;
  INSERT INTO ideeo.inference_budget(tenant_id,day) VALUES(s->>'tenant_id',today) ON CONFLICT DO NOTHING;
  UPDATE ideeo.inference_budget SET model_attempts=model_attempts+CASE WHEN kind_requested='model' THEN 1 ELSE 0 END,
    tool_attempts=tool_attempts+CASE WHEN kind_requested='tool' THEN 1 ELSE 0 END
    WHERE tenant_id=s->>'tenant_id' AND day=today AND model_attempts<64 AND tool_attempts<64;
  IF NOT FOUND THEN RETURN QUERY SELECT 'inference_budget_exhausted'::text,NULL::uuid,op.deadline_at; RETURN; END IF;
  attempt_id := gen_random_uuid(); deadline := op.deadline_at; code := 'reserved';
  INSERT INTO ideeo.inference_attempts(scope,request_key,id,kind) VALUES(s,k,attempt_id,kind_requested);
  RETURN NEXT;
END $$;
CREATE FUNCTION ideeo.reserve_workspace_inference(s jsonb,k text,c uuid,f text,kind_requested text)
RETURNS TABLE(code text,attempt_id uuid,deadline timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,ideeo AS $$
DECLARE op ideeo.inference_operations; used integer; today date := (clock_timestamp() AT TIME ZONE 'UTC')::date;
BEGIN
  IF s IS DISTINCT FROM nullif(current_setting('ideeo.caller',true),'')::jsonb OR NOT ideeo.valid_scope(s)
    OR kind_requested NOT IN ('model','tool') THEN RAISE EXCEPTION 'invalid inference caller'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(s::text || k,61));
  IF NOT EXISTS(SELECT 1 FROM ideeo.conversations WHERE scope=s AND id=c AND expires_at>clock_timestamp()) THEN
    RETURN QUERY SELECT 'conversation_expired'::text,NULL::uuid,NULL::timestamptz; RETURN;
  END IF;
  INSERT INTO ideeo.inference_operations(scope,request_key,conversation_id,fingerprint,deadline_at,profile) VALUES(s,k,c,f,clock_timestamp()+interval '60 seconds','workspace') ON CONFLICT DO NOTHING;
  SELECT * INTO op FROM ideeo.inference_operations WHERE scope=s AND request_key=k;
  IF op.profile<>'workspace' THEN RETURN QUERY SELECT 'inference_profile_mismatch'::text,NULL::uuid,op.deadline_at; RETURN; END IF;
  IF op.conversation_id<>c OR op.fingerprint<>f THEN
    RETURN QUERY SELECT 'idempotency_conflict'::text,NULL::uuid,NULL::timestamptz; RETURN;
  END IF;
  IF op.deadline_at<=clock_timestamp() THEN
    RETURN QUERY SELECT 'inference_expired'::text,NULL::uuid,op.deadline_at; RETURN;
  END IF;
  SELECT count(*) INTO used FROM ideeo.inference_attempts WHERE scope=s AND request_key=k AND kind=kind_requested;
  IF used >= (CASE WHEN kind_requested='model' THEN 8 ELSE 7 END) THEN
    RETURN QUERY SELECT 'inference_budget_exhausted'::text,NULL::uuid,op.deadline_at; RETURN;
  END IF;
  INSERT INTO ideeo.inference_budget(tenant_id,day) VALUES(s->>'tenant_id',today) ON CONFLICT DO NOTHING;
  UPDATE ideeo.inference_budget SET model_attempts=model_attempts+CASE WHEN kind_requested='model' THEN 1 ELSE 0 END,
    tool_attempts=tool_attempts+CASE WHEN kind_requested='tool' THEN 1 ELSE 0 END
    WHERE tenant_id=s->>'tenant_id' AND day=today AND model_attempts<64 AND tool_attempts<64;
  IF NOT FOUND THEN RETURN QUERY SELECT 'inference_budget_exhausted'::text,NULL::uuid,op.deadline_at; RETURN; END IF;
  attempt_id := gen_random_uuid(); deadline := op.deadline_at; code := 'reserved';
  INSERT INTO ideeo.inference_attempts(scope,request_key,id,kind) VALUES(s,k,attempt_id,kind_requested);
  RETURN NEXT;
END $$;
REVOKE ALL ON FUNCTION ideeo.reserve_workspace_inference(jsonb,text,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ideeo.reserve_workspace_inference(jsonb,text,uuid,text,text) TO ideeo_runtime;
RESET ROLE;
