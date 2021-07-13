const endpoint = "http://localhost:5000/japanese_sentence_parser";
let selectedText = "";

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

  return fetch(endpoint, request)
    .then((res) => res.json())
    .then((resJSON) => console.log(resJSON));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  selectedText = request;
  return true;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "parse-sentence") {
    parseSentenceAndAddToSheets(selectedText);
  }
});
