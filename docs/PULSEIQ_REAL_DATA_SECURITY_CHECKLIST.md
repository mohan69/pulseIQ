# PulseIQ Real Data Security Checklist

PulseIQ Assessment Workbench is an internal RightSense diagnostic tool. Before
using real customer data, the deployment and engagement must meet this minimum
checklist.

## Required Before Real Data

- Turn on Vercel Authentication or equivalent deployment protection before any
  customer upload.
- Keep `/app` routes internal-only. The workbench layout sets
  `robots: { index: false, follow: false }` for `/app`.
- Use admin-only/internal access. No customer portal exists in this stage.
- Do not upload customer data unless the engagement is approved and covered by
  NDA/confidentiality terms.
- Do not use public upload paths. Local uploads must remain outside `public/`.
- Use `PULSEIQ_DATA_MODE=database` for real diagnostic work; memory mode is for
  demo and local development.

## Recommended Vercel Environment Variables

```env
INTERNAL_APP_MODE=true
DEPLOYMENT_PROTECTION_NOTE="Protected by Vercel Authentication"
PULSEIQ_DATA_MODE=database
DATABASE_URL="postgresql://..."
STORAGE_PROVIDER=azure
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=..."
AZURE_STORAGE_CONTAINER=pulseiq-sources
PULSEIQ_MAX_UPLOAD_BYTES=10485760
AI_PROVIDER=mock
OPENROUTER_API_KEY=
OPENROUTER_MODEL="openrouter/auto"
OPENROUTER_SITE_URL="https://your-protected-app.example"
OPENROUTER_APP_NAME="PulseIQ"
```

## Upload And Storage Rules

- Supported MVP uploads: TXT, CSV, PDF, DOCX, PPTX, XLSX.
- Executable, script, archive, unsupported, empty, and over-size files are
  rejected.
- `PULSEIQ_MAX_UPLOAD_BYTES` controls max upload size. Default is 10 MB.
- Local storage writes to `.pulseiq/uploads/...` and is dev/internal only.
- Azure Blob Storage is supported for production-style uploads when
  `STORAGE_PROVIDER=azure`.
- Azure containers must remain private. Do not enable public blob/container
  access.
- Secure object storage is required for production, such as Azure Blob or S3
  with private containers/buckets, scoped access, encryption, retention
  policies, and auditable deletion.
- Malware scanning is required before production customer use.

## Audit Events

The workbench records practical audit events for:

- assessment created
- source added manually
- source uploaded
- source deleted
- assessment deleted
- analysis run
- analysis completed
- analysis failed
- report generated
- report printed

Audit events are in-memory in memory mode and persisted through `AuditEvent` in
database mode.

## Deletion And Retention

- Assessment delete removes assessment database records and cascaded source,
  fact, document, and output records.
- Source delete removes source database records and cascaded extracted
  documents/facts.
- Current limitation: local uploaded files under `.pulseiq/uploads/...` are not
  deleted automatically by the Stage 5 controls. For local/internal use, remove
  the matching upload directory as part of the customer deletion procedure.
- Azure Blob delete support exists at the provider layer. Production operations
  still need explicit retention and deletion workflows before broader real-data
  use.

## Customer Data Deletion Procedure

1. Confirm the customer, engagement, and assessment id.
2. Export or preserve audit records if the engagement requires them.
3. Delete the source or assessment from the workbench.
4. Delete matching local files under `.pulseiq/uploads/{assessmentId}` if using
   local storage.
5. For production object storage, delete all associated objects and confirm the
   deletion in storage logs.
6. Record completion in the engagement tracker.

## Email And Meeting Data

- Email and meeting summaries are optional and must be scoped to the engagement.
- Summarise only what is needed for the diagnostic.
- Do not use PulseIQ for employee surveillance.
- Avoid uploading personal employee data unless it is explicitly required,
  approved, and protected.

## Remaining Production Requirements

- Full authentication and authorization.
- Tenant isolation and role-based access.
- Secure production object storage.
- Malware scanning.
- Retention and legal hold policy.
- Complete audit log review UI.
- Incident response and data export/deletion runbooks.
