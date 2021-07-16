document.addEventListener("keydown", (e) => {
  const selectedText = window.getSelection().toString();

  console.log(selectedText);

  chrome.runtime.sendMessage(selectedText, (r) => {
    console.log(r);
  });
});
