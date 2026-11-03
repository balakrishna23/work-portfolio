# Cutsway: launch builds

Two finished designs, each a complete static site. Pick one and upload that folder.

- `nightshift/`: one night in the studio, 9 pm to 9 am, under the neon CUTSWAY sign
- `rawpile/`: the raw pile burned down to the CUTSWAY wordmark

Both show Cutsway's own thumbnails and reel, from `assets/work/`.

## Before going live

Open `shared/site-config.js` in the folder you're launching. Already filled in:

- **`email`**: `cutsway.socialmanager@gmail.com`
- **`whatsapp`**: +91 62813 01476 (written `916281301476`, with no + or spaces)
- **`socials`**: YouTube and Instagram. TikTok, X and Discord are empty, so they stay hidden.

Still to do:

1. **`formUrl`**: done (connected 2026-11-01). To change it, see "Connecting the enquiry form to Gmail" below.
2. **`bookingUrl`** (optional): a Google Calendar booking page, Calendly or Cal.com link. The enquiry form offers it after someone sends their details.
3. **`turnaround`**: the hours you actually promise. The calculator, the due date and Night Shift's clock all read these.
4. **Domain.** Rawpile is configured for `https://cutsway.com/` in `index.html` (canonical, `og:url`, `og:image`, structured data), `robots.txt` and `sitemap.xml`. The build script uses this domain for generated SEO files.

## Connecting the enquiry form to Gmail

Every "Book a call" button opens the enquiry form. Each enquiry then:

- arrives in cutsway.socialmanager@gmail.com under the label **Cutsway Enquiries**, with reply-to set to the person, so replying answers them;
- is added as a row to a Google Sheet, which becomes your contact list.

This runs on your own Google account through a small script (`tools/enquiry-form.gs`). There is no third-party form service. It is free, up to about 100 enquiries a day.

1. Sign in to Google as **cutsway.socialmanager@gmail.com**.
2. Go to sheets.new to open a new Google Sheet. Name it **Cutsway enquiries**.
3. In the sheet, choose **Extensions → Apps Script**. Delete the sample code, paste in everything from `tools/enquiry-form.gs`, and click **Save**.
   - If Google's multi-account session cannot open the bound editor, create a project from the Apps Script dashboard under the Cutsway account. The script's `SPREADSHEET_ID` explicitly targets the **Cutsway enquiries** sheet created for this setup. `setup` stores that ID for the deployed web app, which cannot use the editor's active spreadsheet.
4. Choose the function **setup** in the toolbar and click **Run**. Google will ask for permission:
   - click **Review permissions**;
   - choose the account;
   - if you see "Google hasn't verified this app", click **Advanced → Go to (your project) (unsafe)**; it's your own script;
   - click **Allow**.

   This creates the **Cutsway Enquiries** label in Gmail and the header row in the sheet.
5. Click **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone

   Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
6. Paste the URL into `shared/site-config.js`:
   ```js
   formUrl: 'https://script.google.com/macros/s/…/exec',
   ```
7. Re-upload the site, or edit `shared/site-config.js` on the host directly.
8. Test it: open the site, click **Book a call**, and send yourself an enquiry. Within a few seconds it should appear in Gmail under **Cutsway Enquiries**, and as a new row in the sheet.

Good to know:

- **Label shows in the sidebar.** In Gmail, the label appears in the left sidebar like a folder. On the phone app it's under the menu.
- **Label only, not the inbox.** Enquiries also stay in the inbox so you don't miss them. To keep them only in the label, set `SKIP_INBOX = true` at the top of the script.
- **Editing the script later.** Go to **Deploy → Manage deployments → Edit (pencil)**, set **Version: New version**, then **Deploy**. The URL stays the same.
- **Spam.** A hidden field catches basic spam bots. Their messages are dropped without an email.

## Uploading

Drag the folder onto Netlify or Cloudflare Pages, or point Vercel or any static host at it. No build step is needed.

- `_headers` sets caching on Netlify and Cloudflare Pages. Other hosts ignore it.
- `.htaccess` sets the default index, branded 404, media MIME types and cache lifetimes for Hostinger's Apache/LiteSpeed hosting.
- `404.html` is the branded "not found" page.

For Hostinger, add a **Custom PHP/HTML** website for `cutsway.com`, upload the **contents** of `launch/rawpile/` (including `.htaccess`) to its `public_html`, and enable SSL. Keep `index.html` directly inside `public_html`, not nested inside a `rawpile` folder. No Node.js or database setup is required.

To change the design itself, edit the files in `prototypes/` and rebuild:

```
python tools/build_launch.py            # both designs
python tools/build_launch.py rawpile    # one design
```

## What's inside

- **3D:** three.js r160 and Lenis, loaded from jsdelivr with pinned versions. Archivo comes from Google Fonts.
- **When 3D isn't available:** with no WebGL, data saver on, or a blocked CDN, the page shows `poster.jpg` behind the same content.
- **Speed on slower devices:** quality steps down automatically. Phones start at a lower resolution.
- **Accessibility:** reduced motion is respected, there's a skip link, the phone menu works by keyboard (Escape closes it), and an axe audit shows no violations at desktop or phone size.
- **Credits:**
  - The editor character in Night Shift is Mixamo's "Michelle", from the three.js examples.
  - The platform logos are Simple Icons glyphs (CC0).
