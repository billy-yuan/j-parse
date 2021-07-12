let selectedText = "";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  selectedText = request;
  return true;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "parse-sentence") {
    console.log(selectedText);
  }
});
