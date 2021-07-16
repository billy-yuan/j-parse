const keys = ["apiKey", "spreadsheetId", "sheetName"];

function saveOptions() {
  const apiKey = document.getElementById("api-key").value;
  const spreadsheetId = document.getElementById("spreadsheet-id").value;
  const sheetName = document.getElementById("sheet-name").value;

  const settings = {
    apiKey: apiKey,
    spreadsheetId: spreadsheetId,
    sheetName: sheetName,
  };

  chrome.storage.sync.set(settings, () => {
    const savedStatus = document.getElementById("saved-status");
    savedStatus.textContent = "Options saved!";
    setTimeout(() => (savedStatus.textContent = ""), 1000);
  });
}

function loadOptions() {
  chrome.storage.sync.get(keys, (result) => {
    document.getElementById("api-key").value = result.apiKey;
    document.getElementById("spreadsheet-id").value = result.spreadsheetId;
    document.getElementById("sheet-name").value = result.sheetName;
  });
}

document.addEventListener("DOMContentLoaded", loadOptions);
document.querySelector("#save").addEventListener("click", saveOptions);
