document.addEventListener("keydown", (e) => {
  const selectedText = window.getSelection().toString();

  chrome.runtime.sendMessage(selectedText);
});
