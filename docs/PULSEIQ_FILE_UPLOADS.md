# PulseIQ File Uploads

PulseIQ Assessment Workbench supports optional source file uploads on:

`/app/assessments/[id]/sources`

Manual source registration remains available without a file.

## Supported File Types

The Stage 3 upload allowlist is:

- TXT
- CSV
- PDF
- DOCX
- PPTX
- XLSX

Executable and unsupported extensions are rejected. MIME type, extension, file
size, and empty-file checks run before storage.

The default maximum upload size is 10 MB. It can be changed with:

```env
PULSEIQ_MAX_UPLOAD_BYTES=10485760
```

## Local Storage

Local storage remains the default development provider:

```env
STORAGE_PROVIDER=local
```

The local development provider writes files outside public web routes:

```text
.pulseiq/uploads/{assessmentId}/{sourceId}/{fileName}
```

`.pulseiq/` is ignored by Git. Uploaded files are not written under `public/`
and are not directly downloadable through a public URL.

Each uploaded source stores:

- Original file name
- MIME type
- Byte size
- SHA-256 checksum
- Storage provider
- Storage key
- Extraction status
- Text preview, extraction timestamp, or extraction error

## Extraction Behavior

TXT, CSV, searchable PDF, DOCX, and XLSX files are extracted immediately:

- TXT is decoded as UTF-8 text.
- CSV is decoded as UTF-8 and stored as header plus numbered rows.
- PDF uses searchable text extraction only. Scanned or image-based PDFs are
  marked failed with: "PDF appears to be scanned or image-based. OCR is not
  enabled yet."
- DOCX uses document text extraction and keeps paragraphs readable. Basic table
  text is included when the document exposes it as text.
- XLSX extracts workbook sheets, includes sheet names, headers, and the first
  configured rows per sheet.
- Full extracted content is stored as a `SourceDocument`.
- A compact preview is stored on the source for the registry UI.

PPTX files are stored successfully but remain `extraction_pending`. Stage 6 does
not add OCR or slide extraction.

## Extraction Limits

Extraction is capped to avoid oversized source documents:

```env
PULSEIQ_MAX_EXTRACTED_CHARS=100000
PULSEIQ_XLSX_MAX_ROWS_PER_SHEET=200
```

If extracted text is capped, the source registry shows a truncation indicator
and the stored text includes a truncation note. XLSX sheets are capped per sheet
before the overall character cap is applied.

## Memory And Database Modes

Both repository modes support upload metadata:

- Memory mode keeps metadata and extracted documents in the process-global
  memory repository. Uploaded file bytes still use local disk storage.
- Database mode persists source metadata and extracted documents through
  Prisma/PostgreSQL.

Memory metadata resets when the process restarts. Local file bytes remain on
disk until manually deleted.

## Azure Blob Storage

Production-style storage can use Azure Blob Storage:

```env
STORAGE_PROVIDER=azure
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=..."
AZURE_STORAGE_CONTAINER=pulseiq-sources
```

When `STORAGE_PROVIDER=azure`, uploaded file bytes are written to a private Blob
container. The workbench stores only metadata plus the container and blob key in
the database. It does not create public URLs.

Blob keys use this shape:

```text
org/{organizationId}/assessment/{assessmentId}/source/{sourceId}/{checksum}-{safeFileName}
```

Until tenant/auth work is added, `organizationId` defaults to
`org-pulseiq-internal` unless `PULSEIQ_STORAGE_ORGANIZATION_ID` is configured.

The current upload path extracts content from the in-memory uploaded buffer
immediately, so analysis does not need to read files back from Azure yet.

## Security Limitations

This internal MVP does not yet include:

- Authentication or authorization
- Malware scanning
- Per-customer encryption keys
- Automated retention/deletion rules
- Content-disposition download routes
- Deep file-signature inspection
- OCR for scanned/image-based PDFs

Do not expose this upload route to untrusted public users before those controls
are added.

## Future Storage Providers

The storage interface is provider-based. Azure Blob Storage is available now;
a later stage can add AWS S3 or another object store while keeping repository
metadata and UI behavior stable. Production providers should use private
buckets/containers, server-side encryption, short-lived signed URLs only when
download routes are added, and malware scanning.
