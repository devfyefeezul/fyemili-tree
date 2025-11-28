function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('People');
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Sheet "People" not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const json = data.map(row => {
    let temp = {};
    headers.forEach((header, i) => temp[header] = row[i]);
    return temp;
  });

  return ContentService.createTextOutput(JSON.stringify(json))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('People');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Sheet "People" not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // HANDLE UPDATE (formerly doPut)
    // Google Apps Script doesn't support PUT, so we use POST with an action flag
    if (data.action === 'update') {
      const idIndex = headers.indexOf('id');
      if (idIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ error: 'ID column not found' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Find the row with matching ID
      const rows = sheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][idIndex] == data.id) { // Use loose equality for ID matching
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex === -1) {
        return ContentService.createTextOutput(JSON.stringify({ error: 'Person not found' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Update the row
      // We only update fields that are present in the data
      const row = headers.map((header, index) => {
        // If the field is in the data, update it. Otherwise keep existing value.
        if (data[header] !== undefined) {
          let value = data[header];
          if (value === null) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return value;
        }
        return rows[rowIndex - 1][index];
      });

      sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', row: row }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // HANDLE CREATE (Standard POST)
    // Build row with proper handling of each field
    const row = headers.map(header => {
      // Handle ID generation - use sequential running number
      if (header === 'id' && !data.id) {
        const currentRowCount = sheet.getLastRow() - 1;
        return (currentRowCount + 1).toString();
      }

      // Handle status - default to 'active' if not provided
      if (header === 'status' && !data.status) {
        return 'active';
      }

      // Handle parentId and spouseId - ensure they're empty string if not provided or null
      if ((header === 'parentId' || header === 'spouseId') && (!data[header] || data[header] === null)) {
        return '';
      }

      // For all other fields, use provided value or empty string
      let value = data[header];
      if (value === undefined || value === null) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    });

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', row: row }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doDelete(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('People');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Sheet "People" not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const params = JSON.parse(e.postData.contents);
    const id = params.id;
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idIndex = headers.indexOf('id');
    const parentIdIndex = headers.indexOf('parentId');

    if (idIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'ID column not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Find the row with matching ID and get its parentId
    const rows = sheet.getDataRange().getValues();
    let rowIndex = -1;
    let deletedPersonParentId = null;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex] === id) {
        rowIndex = i + 1;
        deletedPersonParentId = rows[i][parentIdIndex];
        break;
      }
    }

    if (rowIndex === -1) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Person not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Re-parent children: update all rows where parentId === id to deletedPersonParentId
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][parentIdIndex] === id) {
        sheet.getRange(i + 1, parentIdIndex + 1).setValue(deletedPersonParentId || '');
      }
    }

    // Delete the row
    sheet.deleteRow(rowIndex);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
