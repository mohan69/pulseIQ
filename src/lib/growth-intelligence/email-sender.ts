export type ApprovedEmailRequest = {
  recipient: string;
  subject: string;
  body: string;
};

export type ApprovedEmailResult =
  | {
      ok: true;
      providerMessageId: string;
      threadId?: string;
    }
  | {
      ok: false;
      code: "NOT_CONFIGURED";
      message: "Email sending not configured";
    };

export async function sendApprovedEmail(
  request: ApprovedEmailRequest,
): Promise<ApprovedEmailResult> {
  void request;
  return {
    ok: false,
    code: "NOT_CONFIGURED",
    message: "Email sending not configured",
  };
}
