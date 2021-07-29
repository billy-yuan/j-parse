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

function addToSpreadsheet(sentence, words, url) {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    gapi.auth.setToken({
      access_token: token,
    });

    const body = {
      values: [createRowArray(sentence, words, url)],
    };

    appendRow(body);
  });
}

function appendRow(body) {
  gapi.client.sheets.spreadsheets.values
    .append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "USER_ENTERED",
      resource: body,
    })
    .then((response) => {
      console.log(`${response.result.updates.updatedCells} cells appended.`);
      sendMessageToContentScript(true);
    })
    .catch((error) => {
      console.log("Error", error.body);
      sendMessageToContentScript(false);
    });
}

async function parseSentenceAndAddToSheets(data) {
  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  await fetch(PARSER_API_ENDPOINT, request)
    .then((res) => res.json())
    .then((resJSON) => {
      if (resJSON && resJSON.words) {
        addToSpreadsheet(resJSON.sentence, resJSON.words.toString(), data.url);
      }
    })
    .catch((error) => console.log(error));
}

function createRowArray(sentence, words, url) {
  // TODO: update createRow so that user can customize the row
  return [sentence, words, url];
}

function getTabUrlPromise() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const selectedTextUrl = tabs[0].url;

      try {
        resolve(selectedTextUrl);
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sendMessageToContentScript(success) {
  const action = success ? "open_dialog_box" : "error";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: action });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  selectedText = request;
  return true;
});

chrome.commands.onCommand.addListener((command) => {
  if (selectedText.trim() === "") {
    return;
  }
  if (command === "parse-sentence") {
    // TODO: Add function that checks whether API key, spreadsheetId, and range are valid
    loadOptions();
    getTabUrlPromise()
      .then((tabUrl) => ({
        sentence: selectedText,
        url: tabUrl,
      }))
      .then((data) => {
        parseSentenceAndAddToSheets(data);
      });
  }
});
