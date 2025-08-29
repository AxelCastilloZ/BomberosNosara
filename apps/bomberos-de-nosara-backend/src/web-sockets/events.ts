export const WebSocketEvents = {
  REPORT_CREATED: 'report:created',
  REPORT_UPDATED: 'report:updated',
  FORM_SUBMITTED: 'form:submitted',
  FORM_UPDATED: 'form:updated',
} as const;


export type ReportPayload = {
  id: string;
  type: 'fire' | 'accident' | 'rescue' | 'other';
  description?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
  createdAt: string;
  location: { lat: number; lng: number };
};

export type FormSubmissionPayload = {
  id: string;
  formKey: string;
  submittedAt: string;

};
