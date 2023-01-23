console.log("chrome extension ready to go.");

// Add a message listener that listens for a message from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // This is the whole message object that was sent from the popup
    console.log(message);
  

    const newCookie = message.number;
    const status = message.showcookies;
    console.log(newCookie);
    console.log(status);

    // original images
    let oldImages = document.querySelectorAll("img");

    // for manipulating
    const images = document.querySelectorAll("img");
    console.log(images);
    if (status) {
        for (let i = 0; i < newCookie; i++) {
            images[i].src = "https://media.giphy.com/media/Sqgc7YiKVXcLG12cnZ/giphy.gif";
        }
    } else if (status = false) {
        for (let i = 0; i < newCookie; i++) {
            images[i].src = oldImages[i].src;
        }
    }

  });
  