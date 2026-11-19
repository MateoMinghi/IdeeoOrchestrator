/** Caller binding derived from verified proof; request JSON cannot supply another principal. */
export type AdmissionContext = Readonly<{
  tenant_id: string;
  membership_id: string;
  client_id: string;
  agent_account_id: string;
  grant_id: string;
}>;

/** Proposed tenant status request; this extension is not implemented by the inspected PayMe broker. */
export type AuthorityAdmissionRequest = Readonly<{
  api_version: 'ideeo-admission-1';
  request_id: string;
  context: AdmissionContext;
  authentication: Readonly<{
    channel: 'sdk' | 'whatsapp';
    auth_time: number;
    channel_binding_id: string | null;
  }>;
}>;

export type AdmissionState = 'active' | 'inactive' | 'paused' | 'revoked' | 'expired';

/** Fresh status for the exact request and caller; all times are integer UTC epoch seconds. */
export type AuthorityAdmissionReply = Readonly<{
  api_version: 'ideeo-admission-1';
  request_id: string;
  context: AdmissionContext;
  checked_at: number;
  membership: Readonly<{ status: AdmissionState }>;
  agent_account: Readonly<{ status: AdmissionState }>;
  grant: Readonly<{ status: AdmissionState; expires_at: number; scopes: readonly string[] }>;
  channel_binding: Readonly<{
    id: string;
    status: AdmissionState;
    auth_time: number;
    expires_at: number;
  }> | null;
}>;

/** GET /v2/session confirms current admission only; it grants no tool or financial permission. */
export type IdeeoSessionReply = Readonly<{
  api_version: '2';
  request_id: string;
  status: 'admitted';
  tenant_id: string;
  client_id: string;
  channel: 'sdk' | 'whatsapp';
  banking_presentation: 'host' | 'protected_link';
}>;
