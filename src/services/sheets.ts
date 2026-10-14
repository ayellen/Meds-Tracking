import { MedicationLogEntry, SpreadsheetInfo } from '../types';

const DEFAULT_TITLE = 'Wear OS Medication Log';

/**
 * Retrieves the first sheet tab title from a spreadsheet to avoid hardcoding "Sheet1".
 */
export async function getFirstSheetTitle(
  accessToken: string,
  spreadsheetId: string
): Promise<string> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to fetch spreadsheet info (${res.status})`
    );
  }

  const data = await res.json();
  const sheets = data.sheets;
  if (sheets && sheets.length > 0) {
    return sheets[0].properties.title;
  }
  return 'Medication Logs';
}

/**
 * Searches for an existing "Wear OS Medication Log" spreadsheet in Google Drive.
 */
export async function findExistingSpreadsheet(
  accessToken: string
): Promise<SpreadsheetInfo | null> {
  try {
    const query = encodeURIComponent(
      `name = '${DEFAULT_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    );
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&orderBy=modifiedTime desc&pageSize=1`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      console.warn('Could not query Drive files:', await res.text());
      return null;
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      const file = data.files[0];
      const sheetName = await getFirstSheetTitle(accessToken, file.id).catch(
        () => 'Medication Logs'
      );
      return {
        id: file.id,
        name: file.name,
        url: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
        sheetName,
      };
    }
    return null;
  } catch (err) {
    console.warn('Error finding existing spreadsheet:', err);
    return null;
  }
}

/**
 * Creates a dedicated "Wear OS Medication Log" Google Sheet with styled headers.
 */
export async function createMedicationSpreadsheet(
  accessToken: string
): Promise<SpreadsheetInfo> {
  const requestBody = {
    properties: {
      title: DEFAULT_TITLE,
    },
    sheets: [
      {
        properties: {
          title: 'Medication Logs',
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 10,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  {
                    userEnteredValue: { stringValue: 'Timestamp' },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.1, green: 0.2, blue: 0.35 },
                    },
                  },
                  {
                    userEnteredValue: { stringValue: 'Date' },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.1, green: 0.2, blue: 0.35 },
                    },
                  },
                  {
                    userEnteredValue: { stringValue: 'Time' },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.1, green: 0.2, blue: 0.35 },
                    },
                  },
                  {
                    userEnteredValue: { stringValue: 'Medication' },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.1, green: 0.2, blue: 0.35 },
                    },
                  },
                  {
                    userEnteredValue: { stringValue: 'Dosage' },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.1, green: 0.2, blue: 0.35 },
                    },
                  },
                  {
                    userEnteredValue: { stringValue: 'Logged Via' },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.1, green: 0.2, blue: 0.35 },
                    },
                  },
                  {
                    userEnteredValue: { stringValue: 'Notes / Status' },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.1, green: 0.2, blue: 0.35 },
                    },
                  },
                  {
                    userEnteredValue: { stringValue: 'Dose # Today' },
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.1, green: 0.2, blue: 0.35 },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to create spreadsheet (${res.status})`
    );
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const sheetName = data.sheets?.[0]?.properties?.title || 'Medication Logs';

  return {
    id: spreadsheetId,
    name: DEFAULT_TITLE,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    sheetName,
  };
}

/**
 * Appends a new medication dose log row to the spreadsheet.
 */
export async function appendMedicationLog(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  entry: MedicationLogEntry
): Promise<boolean> {
  const encodedSheet = encodeURIComponent(sheetName);
  const range = `${encodedSheet}!A:H`;

  const body = {
    range: `${sheetName}!A:H`,
    majorDimension: 'ROWS',
    values: [
      [
        entry.timestamp,
        entry.date,
        entry.time,
        entry.medicationName,
        entry.dosage,
        entry.loggedVia,
        entry.notes,
        entry.doseNumberToday,
      ],
    ],
  };

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to log medication to spreadsheet (${res.status})`
    );
  }

  return true;
}

/**
 * Fetches recent medication logs from the Google Sheet.
 */
export async function fetchMedicationLogs(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string
): Promise<MedicationLogEntry[]> {
  const encodedSheet = encodeURIComponent(sheetName);
  const range = `${encodedSheet}!A2:H`;

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to read spreadsheet values (${res.status})`
    );
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  return rows
    .map((row, index) => ({
      id: `row-${index + 2}`,
      timestamp: row[0] || '',
      date: row[1] || '',
      time: row[2] || '',
      medicationName: row[3] || 'Unknown Medication',
      dosage: row[4] || '',
      loggedVia: row[5] || 'Wear OS',
      notes: row[6] || '',
      doseNumberToday: Number(row[7]) || 1,
    }))
    .reverse(); // Newest first
}
