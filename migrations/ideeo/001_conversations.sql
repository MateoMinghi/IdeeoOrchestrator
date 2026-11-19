CREATE ROLE ideeo_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE ideeo_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE ideeo_maintenance NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
CREATE SCHEMA ideeo AUTHORIZATION ideeo_owner;
SET LOCAL ROLE ideeo_owner;
CREATE TABLE ideeo.schema_version (version integer PRIMARY KEY CHECK (version = 1));
INSERT INTO ideeo.schema_version VALUES (1);
CREATE FUNCTION ideeo.valid_scope(s jsonb) RETURNS boolean LANGUAGE sql IMMUTABLE STRICT
SET search_path = pg_catalog AS $$
  SELECT jsonb_typeof(s) = 'object'
    AND s ?& ARRAY['tenant_id','membership_id','client_id','agent_account_id','grant_id','channel','channel_binding_id']
    AND (SELECT count(*) = 7 FROM jsonb_object_keys(s))
    AND NOT EXISTS (SELECT 1 FROM jsonb_each(s) v WHERE jsonb_typeof(v.value) <> 'string' OR length(v.value #>> '{}') > 100)
    AND NOT EXISTS (SELECT 1 FROM jsonb_each_text(s) v WHERE v.key <> 'channel_binding_id' AND length(v.value) = 0)
    AND ((s->>'channel' = 'sdk' AND s->>'channel_binding_id' = '') OR (s->>'channel' = 'whatsapp' AND length(s->>'channel_binding_id') > 0))
$$;
CREATE TABLE ideeo.conversations (
  scope jsonb NOT NULL CHECK (ideeo.valid_scope(scope)),
  id uuid NOT NULL,
  creation_key text NOT NULL CHECK (creation_key ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  replay_expires_at timestamptz NOT NULL,
  next_sequence integer NOT NULL DEFAULT 1 CHECK (next_sequence BETWEEN 1 AND 1001),
  PRIMARY KEY (scope, id), UNIQUE (scope, creation_key),
  CHECK (expires_at > created_at AND replay_expires_at > expires_at)
);
CREATE TABLE ideeo.turns (
  scope jsonb NOT NULL CHECK (ideeo.valid_scope(scope)),
  id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  idempotency_key text NOT NULL CHECK (idempotency_key ~ '^[a-f0-9]{64}$'),
  fingerprint text NOT NULL CHECK (fingerprint ~ '^[a-f0-9]{64}$'),
  sequence integer NOT NULL CHECK (sequence BETWEEN 1 AND 1000),
  status text NOT NULL CHECK (status = 'completed'),
  user_content jsonb, answer_content jsonb,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (scope, id), UNIQUE (scope, idempotency_key), UNIQUE (scope, conversation_id, sequence),
  UNIQUE (scope, id, conversation_id, sequence),
  FOREIGN KEY (scope, conversation_id) REFERENCES ideeo.conversations(scope, id) ON DELETE CASCADE,
  CHECK ((user_content IS NULL) = (answer_content IS NULL))
);
CREATE TABLE ideeo.outbox (
  scope jsonb NOT NULL CHECK (ideeo.valid_scope(scope)),
  id uuid NOT NULL,
  turn_id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  sequence integer NOT NULL,
  kind text NOT NULL CHECK (kind = 'answer.committed'),
  created_at timestamptz NOT NULL,
  PRIMARY KEY (scope, id), UNIQUE (scope, turn_id),
  FOREIGN KEY (scope, turn_id, conversation_id, sequence) REFERENCES ideeo.turns(scope, id, conversation_id, sequence) ON DELETE CASCADE
);
CREATE INDEX conversations_expiry ON ideeo.conversations (replay_expires_at);
CREATE INDEX turns_expiry ON ideeo.turns (expires_at) WHERE user_content IS NOT NULL;
ALTER TABLE ideeo.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideeo.conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE ideeo.turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideeo.turns FORCE ROW LEVEL SECURITY;
ALTER TABLE ideeo.outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideeo.outbox FORCE ROW LEVEL SECURITY;
CREATE POLICY caller_scope ON ideeo.conversations TO ideeo_runtime
  USING (scope = nullif(current_setting('ideeo.caller', true), '')::jsonb)
  WITH CHECK (scope = nullif(current_setting('ideeo.caller', true), '')::jsonb);
CREATE POLICY caller_scope ON ideeo.turns TO ideeo_runtime
  USING (scope = nullif(current_setting('ideeo.caller', true), '')::jsonb)
  WITH CHECK (scope = nullif(current_setting('ideeo.caller', true), '')::jsonb);
CREATE POLICY caller_scope ON ideeo.outbox TO ideeo_runtime
  USING (scope = nullif(current_setting('ideeo.caller', true), '')::jsonb)
  WITH CHECK (scope = nullif(current_setting('ideeo.caller', true), '')::jsonb);
CREATE POLICY maintenance_owner ON ideeo.conversations TO ideeo_owner USING (true) WITH CHECK (true);
CREATE POLICY maintenance_owner ON ideeo.turns TO ideeo_owner USING (true) WITH CHECK (true);
CREATE POLICY maintenance_owner ON ideeo.outbox TO ideeo_owner USING (true) WITH CHECK (true);
CREATE FUNCTION ideeo.purge_expired() RETURNS TABLE (cleared bigint, removed bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, ideeo AS $$
BEGIN
  UPDATE ideeo.turns SET user_content = NULL, answer_content = NULL
    WHERE expires_at <= clock_timestamp() AND user_content IS NOT NULL;
  GET DIAGNOSTICS cleared = ROW_COUNT;
  DELETE FROM ideeo.conversations WHERE replay_expires_at <= clock_timestamp();
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN NEXT;
END
$$;
REVOKE ALL ON ALL TABLES IN SCHEMA ideeo FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA ideeo FROM PUBLIC;
GRANT USAGE ON SCHEMA ideeo TO ideeo_runtime, ideeo_maintenance;
GRANT EXECUTE ON FUNCTION ideeo.valid_scope(jsonb) TO ideeo_runtime;
GRANT SELECT ON ideeo.schema_version TO ideeo_runtime;
GRANT SELECT, INSERT ON ideeo.conversations, ideeo.turns, ideeo.outbox TO ideeo_runtime;
GRANT UPDATE (next_sequence) ON ideeo.conversations TO ideeo_runtime;
GRANT EXECUTE ON FUNCTION ideeo.purge_expired() TO ideeo_maintenance;
RESET ROLE;
