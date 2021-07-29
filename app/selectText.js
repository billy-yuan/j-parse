let addSentenceCommandPressed = false;

function createPopupDiv(textContent) {
  const DIV_ID = "add-row-confirmation";
  const popupAlreadyExists = document.getElementById(DIV_ID) !== null;

  if (popupAlreadyExists) {
    return;
  }

  const div = document.createElement("div");
  div.id = DIV_ID;
  div.style.position = "fixed";
  div.style.width = "300px";
  div.style.height = "300px";
  div.style.top = "50%";
  div.style.left = "50%";
  div.style.background = "black";
  div.style.zIndex = "100";
  div.style.opacity = "70%";
  div.style.fontSize = "50px";
  div.style.fontColor = "black";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.textAlign = "center";
  div.textContent = textContent;

  document.body.appendChild(div);
  setTimeout(() => document.getElementById(div.id).remove(), 750);
}

// Send selected text to background.js
document.addEventListener("keydown", (event) => {
  const selectedText = window.getSelection().toString();
  chrome.runtime.sendMessage(selectedText);
});

// Display popup on page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "open_dialog_box") {
    createPopupDiv("Sentence added!");
  } else {
    createPopupDiv("Error. Could not add sentence.");
  }

  return true;
});
