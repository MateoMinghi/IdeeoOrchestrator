/** Capability families describe availability, never grant permission to execute a tool. */
export const CAPABILITY_FAMILIES = ['browser','computer','files','data','email','apps','agents','memory','automation','skills','research','images','voice','meetings','hosting','devices','chat','settings'] as const;
export type CapabilityFamily = typeof CAPABILITY_FAMILIES[number];
/** Only currently authorized, explicitly configured tools are available to a conversation. */
export type CapabilityView = Readonly<{ family: CapabilityFamily; available: number }>;
