/**
 * SWEETY SONG HCP SURVEY — Google Apps Script
 * =============================================
 * This script receives survey submissions and appends them to a Google Sheet.
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://sheets.google.com and create a new spreadsheet
 * 2. Name it "Sweety Song HCP Survey Responses"
 * 3. In Row 1, paste these exact column headers (A1 through AA1):
 *
 *    Timestamp | Name | Years in Practice | Specialization | City | State |
 *    Practice Setting | Patients/Month | ⭐ Build Quality | ⭐ Audio Clarity |
 *    ⭐ Ergonomics | ⭐ Probe Sensitivity | Recommendations | Emoji Reassurance |
 *    NPS Score | Hearing Help Tips | ⭐ Doppler+App | ⭐ App Functionality |
 *    App Wishlist | App Wishlist Other | Endorsement 1 | Endorsement 2 |
 *    Endorsement 3 | Endorsement 4 | One-Line Quote | Attribution | The One Thing
 *
 * 4. Go to Extensions → Apps Script
 * 5. Delete any existing code, paste THIS ENTIRE FILE
 * 6. Click Deploy → New Deployment
 * 7. Select type: "Web app"
 * 8. Set "Execute as": Me
 * 9. Set "Who has access": Anyone
 * 10. Click Deploy → Copy the URL
 * 11. Paste that URL into survey.js where it says YOUR_GOOGLE_APPS_SCRIPT_URL_HERE
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Append a new row with all survey fields
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.name || '',
      data.years_in_practice || '',
      data.specialization || '',
      data.city || '',
      data.state || '',
      data.practice_setting || '',
      data.patients_per_month || '',
      data.star_build_quality || '',
      data.star_audio_clarity || '',
      data.star_ergonomics || '',
      data.star_probe || '',
      data.recommendations || '',
      data.emoji_reassurance || '',
      data.nps_score || '',
      data.hearing_help || '',
      data.star_doppler_app || '',
      data.star_app_functionality || '',
      data.app_wishlist || '',
      data.app_wishlist_other || '',
      data.endorsement_1 || '',
      data.endorsement_2 || '',
      data.endorsement_3 || '',
      data.endorsement_4 || '',
      data.one_line_quote || '',
      data.attribution || '',
      data.one_thing || ''
    ]);

    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Required for CORS preflight
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ready', message: 'Sweety Song Survey endpoint is active' }))
    .setMimeType(ContentService.MimeType.JSON);
}
