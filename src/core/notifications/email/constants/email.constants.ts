// === EMAIL PROVIDERS ===
export const EMAIL_PROVIDERS = {
  SMTP: 'smtp',
  SENDGRID: 'sendgrid',
  MAILGUN: 'mailgun',
  MIDDLEWARE: 'middleware',
} as const;

// === EMAIL TEMPLATES - NO MAGIC STRINGS! ===
export const EMAIL_TEMPLATES = {
  // User verification templates
  USER_EMAIL_VERIFICATION: 'user-email-verification',
  USER_PASSWORD_RESET: 'user-password-reset', // eslint-disable-line sonarjs/no-hardcoded-passwords

  // Admin templates
  ADMIN_INVITATION: 'admin-invitation',
  ADMIN_WELCOME: 'admin-welcome',
  ADMIN_PASSWORD_RESET: 'admin-password-reset', // eslint-disable-line sonarjs/no-hardcoded-passwords

  // User invitation templates
  USER_INVITATION: 'user-invitation',

  // General templates
  WELCOME: 'welcome',
  INVITE: 'invite',

  // Initial Approval templates
  IA_SUBMITTED: 'ia-submitted',
  IA_APPROVED: 'ia-approved',
  IA_REJECTED: 'ia-rejected',
  IA_REQUEST_MORE_INFO: 'ia-request-more-info',
} as const;

// === TEMPLATE MAP - TYPE SAFE! ===
export interface TemplateMap {
  [EMAIL_TEMPLATES.USER_EMAIL_VERIFICATION]: {
    userName: string;
    verificationCode: string;
    expiryMinutes: number;
  };
  [EMAIL_TEMPLATES.USER_PASSWORD_RESET]: {
    userName: string;
    verificationCode: string;
    expiryMinutes: number;
  };
  [EMAIL_TEMPLATES.ADMIN_PASSWORD_RESET]: {
    email: string;
    resetLink: string;
    expiryHours: number;
    platformName: string;
  };
  [EMAIL_TEMPLATES.ADMIN_INVITATION]: {
    adminName: string;
    inviterName: string;
    invitationLink: string;
    expiryDays: number;
    invitationDate: string;
    currentYear: number;
  };
  [EMAIL_TEMPLATES.ADMIN_WELCOME]: {
    adminName: string;
    platformName: string;
    loginUrl: string;
  };
  [EMAIL_TEMPLATES.USER_INVITATION]: {
    userName: string;
    userEmail: string;
    inviterName: string;
    invitationLink: string;
  };
  [EMAIL_TEMPLATES.WELCOME]: {
    username: string;
    link: string;
  };
  [EMAIL_TEMPLATES.INVITE]: {
    inviter: string;
    inviteUrl: string;
  };
  [EMAIL_TEMPLATES.IA_SUBMITTED]: {
    requestNo: string;
    applicantName: string;
    legalType: string;
    licenseType: string;
    project: string;
    submissionDate: Date;
    submissionChannel: string;
    requiresTradeNameCertificate: boolean;
  };
  [EMAIL_TEMPLATES.IA_APPROVED]: {
    requestNo: string;
    applicantName: string;
    approvalDate: Date;
    approvedBy: string;
    notes: string;
    nextSteps: string;
  };
  [EMAIL_TEMPLATES.IA_REJECTED]: {
    requestNo: string;
    applicantName: string;
    rejectionDate: Date;
    rejectedBy: string;
    rejectionReason: string;
    nextSteps: string;
    supportContact: string;
  };
  [EMAIL_TEMPLATES.IA_REQUEST_MORE_INFO]: {
    requestNo: string;
    applicantName: string;
    returnDate: Date;
    returnedBy: string;
    message: string;
    requiredActions: string;
    nextSteps: string;
  };
}

// === EMAIL PAYLOAD TYPE ===
export interface EmailPayload<K extends keyof TemplateMap> {
  to: string | string[];
  subject: string;
  template: {
    name: K;
    data: TemplateMap[K];
  };
}
