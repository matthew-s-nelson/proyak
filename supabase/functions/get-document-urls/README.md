# Get Document URLs

This edge function generates temporary signed URLs for candidate resumes and/or cover letters stored in Supabase Storage.

**Note:** This function uses the service role key to access Supabase Storage buckets securely.

## Endpoint

`POST /functions/v1/get-document-urls`

## Request Body

You can provide either or both URLs:

```json
{
  "resume_url": "path/to/resume.pdf",
  "cover_letter_url": "path/to/cover-letter.pdf"
}
```

**At least one URL is required.**

## Response

### Success (200)

```json
{
  "resume_signed_url": "https://...temporary-signed-url...",
  "cover_letter_signed_url": "https://...temporary-signed-url..."
}
```

**Notes:**
- If a URL was not provided in the request, it won't be in the response
- If there was an error generating a signed URL, the value will be `null`
- Signed URLs expire after 1 hour

### Error Responses

- **400 Bad Request**: Neither `resume_url` nor `cover_letter_url` provided
- **500 Internal Server Error**: Server error

## Usage Example

```typescript
// Get both resume and cover letter URLs
const { data, error } = await supabase.functions.invoke('get-document-urls', {
  body: {
    resume_url: 'user123/resume.pdf',
    cover_letter_url: 'user123/cover-letter.pdf'
  }
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('Resume URL:', data.resume_signed_url);
  console.log('Cover Letter URL:', data.cover_letter_signed_url);
}
```

```typescript
// Get only resume URL
const { data, error } = await supabase.functions.invoke('get-document-urls', {
  body: {
    resume_url: 'user123/resume.pdf'
  }
});
```

## Storage Buckets

This function accesses the following Supabase Storage buckets:
- `resumes` - For resume files
- `cover-letters` - For cover letter files

## Security

- Uses service role key for secure access to private storage buckets
- Generates temporary signed URLs that expire after 1 hour
- Does not expose permanent storage URLs

## Deploy

To deploy this function:

```bash
supabase functions deploy get-document-urls
```
