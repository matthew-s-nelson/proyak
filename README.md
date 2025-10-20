# Proyak
## Getting the code running locally
NOTE: I'd strongly advise against using Safari for local development. It was causing me a lot of issues, but it works fine once deployed.
1. Clone the repo to your local machine
2. In the root directory of the project, run `npm install`
3. Run `cp example.env .env` and put in the Supabase project URL and key
   - The url is `https://PROJECT_ID.supabase.co`. You can find the project id in the project settings.
   - The anon key is found in the API Keys tab of the project settings
4. You should now be all set to run `npm run dev` to get the website running locally.

## Routing
- If you have a link that doesn't seem to be sending the user to the right place, make sure the path starts with `/#/`
- For routes that only authenticated users should be able to access, wrap the route in `App.tsx` like this: `<ProtectedRoute><CandidateList /></ProtectedRoute>`

## Authentication
- Authentication is handled in `AuthContext`
- To get the currently logged in user, use `const { user } = useAuth();`
  - To get the user's name: `user.user_metadata?.full_name`

## Calling Supabase Edge Functions
- A good example is `VectorTest.tsx`
- Use `src/lib/supabase.ts` to get the supabase client. Doing so keeps us from starting up multiple clients, which can cause issues.
- The `anon key` in the .env file is ok to use client side because of database policies that are setup.

## Other Tips
- Run `npm run lint` before pushing your code. The GitHub actions workflow will fail if there's
any linting errors.
- Check out the `README.md` in the scripts directory to learn how to do run the script to deploy the edge functions to Supabase from the command line.
   - Note: I also added a GitHub action to deploy the edge functions. You just have to push your commits and then manually run the `Deploy Function` workflow.
