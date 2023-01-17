console.log("chrome extension ready to go.");

chrome.runtime.onMessage.addListener((request) => {
    showCookies = request["enable"];
    if (request["addCookie"]) addCookie();
    renderCookies();
  });