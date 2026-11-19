SET LOCAL ROLE ideeo_owner;
ALTER TABLE ideeo.schema_version DROP CONSTRAINT schema_version_version_check;
ALTER TABLE ideeo.schema_version ADD CHECK (version BETWEEN 1 AND 2);
UPDATE ideeo.schema_version SET version=2;
CREATE TABLE ideeo.inference_operations (
  scope jsonb NOT NULL CHECK (ideeo.valid_scope(scope)),
  request_key text NOT NULL CHECK (request_key ~ '^[a-f0-9]{64}$'),
  conversation_id uuid NOT NULL,
  fingerprint text NOT NULL CHECK (fingerprint ~ '^[a-f0-9]{64}$'),
  deadline_at timestamptz NOT NULL,
  PRIMARY KEY(scope,request_key),
  FOREIGN KEY(scope,conversation_id) REFERENCES ideeo.conversations(scope,id) ON DELETE CASCADE
);
CREATE TABLE ideeo.inference_attempts (
  scope jsonb NOT NULL, request_key text NOT NULL, id uuid NOT NULL,
  kind text NOT NULL CHECK(kind IN ('model','tool')),
  status text NOT NULL DEFAULT 'reserved' CHECK(status IN ('reserved','finished')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  input_tokens integer CHECK(input_tokens>=0), output_tokens integer CHECK(output_tokens>=0),
  cost_usd numeric CHECK(cost_usd>=0),
  PRIMARY KEY(scope,id),
  FOREIGN KEY(scope,request_key) REFERENCES ideeo.inference_operations(scope,request_key) ON DELETE CASCADE,
  CHECK(cost_usd IS NULL)
);
CREATE TABLE ideeo.inference_budget (
  tenant_id text NOT NULL, day date NOT NULL,
  model_attempts integer NOT NULL DEFAULT 0 CHECK(model_attempts BETWEEN 0 AND 64),
  tool_attempts integer NOT NULL DEFAULT 0 CHECK(tool_attempts BETWEEN 0 AND 64),
  PRIMARY KEY(tenant_id,day)
);
ALTER TABLE ideeo.inference_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideeo.inference_operations FORCE ROW LEVEL SECURITY;
ALTER TABLE ideeo.inference_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideeo.inference_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE ideeo.inference_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideeo.inference_budget FORCE ROW LEVEL SECURITY;
CREATE POLICY caller_scope ON ideeo.inference_operations TO ideeo_runtime
  USING(scope=nullif(current_setting('ideeo.caller',true),'')::jsonb) WITH CHECK(scope=nullif(current_setting('ideeo.caller',true),'')::jsonb);
CREATE POLICY caller_scope ON ideeo.inference_attempts TO ideeo_runtime
  USING(scope=nullif(current_setting('ideeo.caller',true),'')::jsonb) WITH CHECK(scope=nullif(current_setting('ideeo.caller',true),'')::jsonb);
CREATE POLICY tenant_scope ON ideeo.inference_budget TO ideeo_runtime
  USING(tenant_id=(nullif(current_setting('ideeo.caller',true),'')::jsonb)->>'tenant_id');
CREATE POLICY maintenance_owner ON ideeo.inference_operations TO ideeo_owner USING(true) WITH CHECK(true);
CREATE POLICY maintenance_owner ON ideeo.inference_attempts TO ideeo_owner USING(true) WITH CHECK(true);
CREATE POLICY maintenance_owner ON ideeo.inference_budget TO ideeo_owner USING(true) WITH CHECK(true);
CREATE FUNCTION ideeo.reserve_inference(s jsonb,k text,c uuid,f text,kind_requested text)
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
  INSERT INTO ideeo.inference_operations VALUES(s,k,c,f,clock_timestamp()+interval '15 seconds') ON CONFLICT DO NOTHING;
  SELECT * INTO op FROM ideeo.inference_operations WHERE scope=s AND request_key=k;
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
CREATE FUNCTION ideeo.finish_inference(s jsonb,i uuid,inputs integer,outputs integer) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,ideeo AS $$
BEGIN
  IF s IS DISTINCT FROM nullif(current_setting('ideeo.caller',true),'')::jsonb THEN RAISE EXCEPTION 'invalid inference caller'; END IF;
  UPDATE ideeo.inference_attempts SET status='finished',input_tokens=inputs,output_tokens=outputs
    WHERE scope=s AND id=i AND status='reserved';
  RETURN FOUND;
END $$;
CREATE OR REPLACE FUNCTION ideeo.purge_expired() RETURNS TABLE(cleared bigint,removed bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,ideeo AS $$
BEGIN
  UPDATE ideeo.turns SET user_content=NULL,answer_content=NULL WHERE expires_at<=clock_timestamp() AND user_content IS NOT NULL;
  GET DIAGNOSTICS cleared=ROW_COUNT;
  DELETE FROM ideeo.conversations WHERE replay_expires_at<=clock_timestamp();
  GET DIAGNOSTICS removed=ROW_COUNT;
  DELETE FROM ideeo.inference_budget WHERE day < (clock_timestamp() AT TIME ZONE 'UTC')::date-1;
  RETURN NEXT;
END $$;
REVOKE ALL ON ideeo.inference_operations,ideeo.inference_attempts,ideeo.inference_budget FROM PUBLIC;
REVOKE ALL ON FUNCTION ideeo.reserve_inference(jsonb,text,uuid,text,text),ideeo.finish_inference(jsonb,uuid,integer,integer) FROM PUBLIC;
GRANT SELECT ON ideeo.inference_operations,ideeo.inference_attempts,ideeo.inference_budget TO ideeo_runtime;
GRANT EXECUTE ON FUNCTION ideeo.reserve_inference(jsonb,text,uuid,text,text),ideeo.finish_inference(jsonb,uuid,integer,integer) TO ideeo_runtime;
RESET ROLE;
