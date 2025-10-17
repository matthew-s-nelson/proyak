# Proyak
## Getting the code running locally
1. Clone the repo to your local machine
2. In the root directory of the project, run `npm install`
3. Run `cp example.env .env` and put in the Supabase project URL and key
   - The url is `https://PROJECT_ID.supabase.co`. You can find the project id in the project settings.
   - The anon key is found in the API Keys tab of the project settings
4. You should now be all set to run `npm run dev` to get the website running locally.

## Other Tips
- Run `npm run lint` before pushing your code. The GitHub actions workflow will fail if there's
any linting errors.
- Check out the `README.md` in the scripts directory to learn how to do run the script to deploy the
edge functions to Supabase from the command line.