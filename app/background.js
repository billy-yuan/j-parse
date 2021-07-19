const PARSER_API_ENDPOINT =
  "https://jparse-api.herokuapp.com/japanese_sentence_parser";
const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
];

let API_KEY;
let SPREADSHEET_ID;
let RANGE;

let selectedText = "";

function loadOptions() {
  chrome.storage.sync.get(
    ["apiKey", "spreadsheetId", "sheetName"],
    (result) => {
      API_KEY = result.apiKey;
      SPREADSHEET_ID = result.spreadsheetId;
      RANGE = result.sheetName;
    }
  );
}

function onGAPILoad() {
  gapi.client
    .init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS,
    })
    .then(() => console.log("gapi initialized"))
    .catch((error) => console.log(error));
}

async function addToSpreadsheet(sentence, words) {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    gapi.auth.setToken({
      access_token: token,
    });

    const body = {
      values: [createRowArray(sentence, words)],
    };

    appendRow(body);
  });
}

async function appendRow(body) {
  gapi.client.sheets.spreadsheets.values
    .append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "USER_ENTERED",
      resource: body,
    })
    .then((response) => {
      console.log(`${response.result.updates.updatedCells} cells appended.`);
    })
    .catch((error) => console.log("Error", error.body));
}

async function parseSentenceAndAddToSheets(sentence) {
  const data = {
    sentence: sentence,
  };

  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  return fetch(PARSER_API_ENDPOINT, request)
    .then((res) => res.json())
    .then((resJSON) => {
      if (resJSON && resJSON.words) {
        addToSpreadsheet(resJSON.sentence, resJSON.words.toString());
      }
    })
    .catch((error) => console.log(error));
}

function createRowArray(sentence, words) {
  // TODO: update createRow so that user can customize the row
  return [sentence, words];
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  selectedText = request;
  return true;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "parse-sentence") {
    // TODO: Add function that checks whether API key, spreadsheetId, and range are valid
    loadOptions();
    parseSentenceAndAddToSheets(selectedText);
  }
});
