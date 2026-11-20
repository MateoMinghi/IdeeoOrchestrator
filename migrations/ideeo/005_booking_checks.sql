SET LOCAL ROLE ideeo_owner;
ALTER TABLE ideeo.schema_version DROP CONSTRAINT schema_version_version_check;
ALTER TABLE ideeo.schema_version ADD CHECK (version BETWEEN 1 AND 5);
UPDATE ideeo.schema_version SET version=5;
CREATE TABLE ideeo.booking_checks (
  scope jsonb NOT NULL, attempt_id uuid NOT NULL, receipt jsonb,
  PRIMARY KEY(scope,attempt_id),
  FOREIGN KEY(scope,attempt_id) REFERENCES ideeo.inference_attempts(scope,id) ON DELETE CASCADE
);
ALTER TABLE ideeo.booking_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideeo.booking_checks FORCE ROW LEVEL SECURITY;
CREATE POLICY caller_scope ON ideeo.booking_checks TO ideeo_runtime
  USING(scope=nullif(current_setting('ideeo.caller',true),'')::jsonb)
  WITH CHECK(scope=nullif(current_setting('ideeo.caller',true),'')::jsonb);
CREATE POLICY maintenance_owner ON ideeo.booking_checks TO ideeo_owner USING(true) WITH CHECK(true);
REVOKE ALL ON ideeo.booking_checks FROM PUBLIC;
GRANT SELECT, INSERT(scope,attempt_id), UPDATE(receipt) ON ideeo.booking_checks TO ideeo_runtime;
CREATE OR REPLACE FUNCTION ideeo.purge_expired() RETURNS TABLE(cleared bigint,removed bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,ideeo AS $$
BEGIN
  DELETE FROM ideeo.booking_checks b USING ideeo.inference_attempts a, ideeo.inference_operations o, ideeo.conversations c
    WHERE (a.scope,a.id)=(b.scope,b.attempt_id) AND (o.scope,o.request_key)=(a.scope,a.request_key)
    AND (c.scope,c.id)=(o.scope,o.conversation_id) AND c.expires_at<=clock_timestamp();
  UPDATE ideeo.turns SET user_content=NULL,answer_content=NULL WHERE expires_at<=clock_timestamp() AND user_content IS NOT NULL;
  GET DIAGNOSTICS cleared=ROW_COUNT;
  DELETE FROM ideeo.conversations WHERE replay_expires_at<=clock_timestamp();
  GET DIAGNOSTICS removed=ROW_COUNT;
  DELETE FROM ideeo.inference_budget WHERE day < (clock_timestamp() AT TIME ZONE 'UTC')::date-1;
  RETURN NEXT;
END $$;
RESET ROLE;
