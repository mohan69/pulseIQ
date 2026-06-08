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

TXT and CSV files are extracted immediately:

- TXT is decoded as UTF-8 text.
- CSV is decoded as UTF-8 and stored as header plus numbered rows.
- Full extracted content is stored as a `SourceDocument`.
- A compact preview is stored on the source for the registry UI.

PDF, DOCX, PPTX, and XLSX files are stored successfully but marked
`extraction_pending`. Stage 3 does not add OCR or unreliable best-effort
parsing.

## Memory And Database Modes

Both repository modes support upload metadata:

- Memory mode keeps metadata and extracted documents in the process-global
  memory repository. Uploaded file bytes still use local disk storage.
- Database mode persists source metadata and extracted documents through
  Prisma/PostgreSQL.

Memory metadata resets when the process restarts. Local file bytes remain on
disk until manually deleted.

## Security Limitations

This internal MVP does not yet include:

- Authentication or authorization
- Malware scanning
- Per-customer encryption keys
- Automated retention/deletion rules
- Content-disposition download routes
- Deep file-signature inspection

Do not expose this upload route to untrusted public users before those controls
are added.

## Future Storage Providers

The storage interface is provider-based. A later stage can add private AWS S3,
Azure Blob Storage, or another object store while keeping repository metadata
and UI behavior stable. Production providers should use private buckets,
server-side encryption, short-lived signed URLs, and malware scanning.
