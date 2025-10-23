# Get Candidate Details

This edge function retrieves comprehensive candidate information by combining data from the `candidate_profiles` table and the `auth.users` schema.

**Note:** This function uses the service role key to access the auth schema via `supabase.auth.admin.getUserById()`.

## Endpoint

`POST /functions/v1/get-candidate-details`

## Request Body

```json
{
  "candidate_profile_id": "uuid-string"
}
```

## Response

### Success (200)

```json
{
  "candidate_profile": {
    "id": "uuid",
    "user_id": "uuid",
    "specialty_id": "uuid",
    "work_type": "remote|hybrid|onsite",
    "employment_type": "full-time|part-time|contract",
    "location": "City, State",
    "bio": "Candidate bio text...",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "specialties": {
      "id": "uuid",
      "name": "Specialty Name"
    }
  },
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "created_at": "timestamp"
  }
}
```

### Error Responses

- **400 Bad Request**: Missing `candidate_profile_id`
- **404 Not Found**: Candidate profile or user not found
- **500 Internal Server Error**: Server error

## Usage Example

```typescript
const { data, error } = await supabase.functions.invoke('get-candidate-details', {
  body: {
    candidate_profile_id: 'abc123-uuid-here'
  }
});

if (error) {
  console.error('Error:', error);
} else {
  console.log('Candidate:', data.candidate_profile);
  console.log('User:', data.user);
}
```

## Deploy

To deploy this function:

```bash
supabase functions deploy get-candidate-details
```
