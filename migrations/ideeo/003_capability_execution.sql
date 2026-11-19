SET LOCAL ROLE ideeo_owner;
ALTER TABLE ideeo.schema_version DROP CONSTRAINT schema_version_version_check;
ALTER TABLE ideeo.schema_version ADD CHECK (version BETWEEN 1 AND 3);
UPDATE ideeo.schema_version SET version=3;
ALTER TABLE ideeo.inference_operations ADD COLUMN execution_id uuid;
CREATE FUNCTION ideeo.claim_tool_execution(s jsonb,k text,c uuid,f text,execution uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,ideeo AS $$
BEGIN
  IF s IS DISTINCT FROM nullif(current_setting('ideeo.caller',true),'')::jsonb OR NOT ideeo.valid_scope(s) OR execution IS NULL THEN
    RAISE EXCEPTION 'invalid execution caller';
  END IF;
  UPDATE ideeo.inference_operations SET execution_id=execution
    WHERE scope=s AND request_key=k AND conversation_id=c AND fingerprint=f AND deadline_at>clock_timestamp()
      AND (execution_id IS NULL OR execution_id=execution);
  RETURN FOUND;
END $$;
REVOKE ALL ON FUNCTION ideeo.claim_tool_execution(jsonb,text,uuid,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ideeo.claim_tool_execution(jsonb,text,uuid,text,uuid) TO ideeo_runtime;
RESET ROLE;
