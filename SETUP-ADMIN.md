# Setting up the Events Admin (one-time, about 15 minutes)

The admin uses Supabase (free plan, no card needed) to store events and photos.
This is a SEPARATE Supabase project from your backend partner's school management system —
they are independent, so nothing here can affect their work, and vice versa.

## Step 1: Create the project
1. Go to supabase.com, sign up, and click **New project**.
2. Name it (e.g. "eeca-website"), set a database password (save it somewhere safe), choose the region nearest to Nigeria, and create it. Wait a minute or two.

## Step 2: Create the tables and photo storage
1. In Supabase open **SQL Editor > New query**.
2. Open `supabase-setup.sql` from this folder, copy everything, paste it, and click **Run**. You should see "Success".

## Step 3: Connect the website
1. In Supabase go to **Project Settings > API** (or "Data API").
2. Copy the **Project URL** and the **anon public key**.
3. Open `js/config.js` and paste them in place of `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` (keep the quotes).

## Step 4: Create the admin login(s)
1. Go to **Authentication > Users > Add user > Create new user**. Enter the admin's email and a strong password, and tick auto-confirm.
2. Go to **Authentication > Sign In / Providers** (settings) and **turn OFF "Allow new users to sign up"**. This is important: only users you create yourself should be able to log in.
3. Repeat Step 4.1 for any other staff member who should manage events.

## Step 5: Upload the site and use it
1. Upload the whole folder to your hosting (or open `index.html` locally to test).
2. Open `yourwebsite.com/admin.html`, log in, and add an event.
3. Open the Events page and the home page: the event appears automatically. Events whose date has passed move to Past Events with their photos.

## Daily use
- **New upcoming event:** Add a title, date/time, venue and description, then Save.
- **After the event:** Click Edit, write what happened, add the cover and gallery photos, then Save.
- **Fix or remove:** Use Edit or Delete in the list. Photos can be removed with the x on each thumbnail.

## Good to know
- Keep `admin.html` off your public menu; share the address only with staff.
- Once `config.js` is filled in, the sample events on the pages are replaced by the real ones. Until then, the samples show.
- Photos are automatically resized before upload, so phone pictures are fine.
- Supabase free projects pause after a week of no activity; visiting the admin or the events page regularly keeps it awake, or you can resume it from the Supabase dashboard.
- If your backend partner's management system later grows its own events/calendar feature, this can be revisited then — for now the two stay separate.
