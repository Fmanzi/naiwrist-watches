/**
 * Google Apps Script for receiving orders from ShopExpress
 *
 * Deployment instructions:
 * 1. Create a new Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this code and save
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the web app URL and paste it as GSHEET_URL in checkout.js
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // If sheet is empty, add a header row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Store', 'Name', 'Phone', 'Address',
        'Payment Method', 'Items', 'Total'
      ]);
    }

    const params = e.parameter;
    sheet.appendRow([
      new Date(),
      params.storeName || '',
      params.name || '',
      params.phone || '',
      params.address || '',
      params.paymentMethod || '',
      params.items || '',
      params.total || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
