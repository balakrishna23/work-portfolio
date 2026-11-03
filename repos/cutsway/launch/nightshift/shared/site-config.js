// Cutsway: launch settings. Fill these in once; every page reads them (load before shared/page.js).
window.CUTSWAY = {
  // The enquiry form's inbox: the web app URL from tools/enquiry-form.gs (Deploy → Web app). Each enquiry is emailed to
  // the Gmail that deployed it, under the "Cutsway Enquiries" label, and saved to its Google Sheet.
  // Left empty, the form opens an email to `email` instead, with the details filled in.
  formUrl: 'https://script.google.com/macros/s/AKfycbx8K6ZrfxbD9LL8TNvZmmcuHeL97mpgg_roLKwR0_-tdOeSIx-2D-Y2HwdlAmx80BA7AQ/exec',
  // Optional: a Google Calendar booking page, Calendly or Cal.com link, offered inside the enquiry form.
  bookingUrl: '',
  // The public inbox. Shown in the footer and used for the email fallback.
  email: 'cutsway.socialmanager@gmail.com',
  // WhatsApp, in international format without + or spaces (India: 91 then the number), and the message it starts with.
  whatsapp: '916281301476',
  whatsappText: "Hi Cutsway, I'd like to talk about editing for my channel.",
  // Profile links. Any left empty are hidden from the footer.
  socials: { youtube: 'https://www.youtube.com/@cutsway', instagram: 'https://www.instagram.com/cutsway/', tiktok: '', x: '', discord: '' },
  // Turnaround promises, in hours from when the files arrive: [step, hours]. The last step is the delivery time.
  turnaround: {
    thumb: [['Brief in', 0], ['Three concepts', 3], ['Final art', 8]],
    shorts: [['VOD in', 0], ['Cut + captions', 10], ['Delivered', 12]],
    video: [['Raw in', 0], ['First cut', 12], ['Your notes', 18], ['Final', 36]],
    podcast: [['Recording in', 0], ['Episode cut', 20], ['Your notes', 26], ['Final', 48]],
  },
};
