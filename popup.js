const form = document.getElementById("control-row");
const go = document.getElementById("go");
const input = document.getElementById("input");
const message = document.getElementById("message");
// tried putting in my own constant name...confused how to link js to html
const cookienum = document.getElementById("cookienum");
const checkbox = document.getElementById("enable");

// showing cookies
checkbox.addEventListener("change", (e) => updateContentScript(false));
async function updateContentScript(addCookie) {
    // Sends a message to the content script with an object that has the
    // current value of the checkbox and a boolean (whether to add a block)
    const message2 = { enable: checkbox.checked, addCookie: addCookie };
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    const response = await chrome.tabs.sendMessage(tab.id, message2);
    // You can do something with response from the content script here
    console.log(response);
  }


let urlForTab = "";
// The async IIFE is necessary because Chrome <89 does not support top level await.
async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    try {
      let url = new URL(tab.url);
      input.value = url.hostname;
      urlForTab = url.hostname;
      console.log(urlForTab);
    } catch {}
  }

  input.focus();
};


// MY STUFF
// create event listener
// inside call getURL function when dom content is loaded
// function getURL() {
//     let cookie = getCookies(stringToUrl(urlForTab));
//     console.log(stringToUrl(urlForTab));
// }

async function setUp (event) {
    await initPopupWindow();
    console.log('DOM fully loaded and parsed');
    console.log(urlForTab);
    let cookie = getCookies(urlForTab);
    // console.log(stringToUrl(urlForTab));    
    console.log(cookie);
}

window.addEventListener('DOMContentLoaded', setUp);

// trying to get current number of cookies, and to update once deleted
async function getCookies(domain) {
    let cookiesDeleted = 0;
    console.log(domain);
    let cookies = await chrome.cookies.getAll({ domain });
    console.log(cookies);
    if (cookies.length > 0) {
        setCookie(cookies.length);
    } else if (cookies.length === 0) {
        setCookie("No cookies found");
    }
}



// trying to print it into extension html
function setCookie(cookie) {
    cookienum.textContent = String(cookie);
    cookienum.hidden = false;
  }


form.addEventListener("submit", handleFormSubmit);


async function handleFormSubmit(event) {
  event.preventDefault();

  clearMessage();

  let url = stringToUrl(input.value);
  if (!url) {
    setMessage("Invalid URL");
    return;
  }

  let message = await deleteDomainCookies(url.hostname);
  setMessage(message);
}

function stringToUrl(input) {
  // Start with treating the provided value as a URL
  try {
    return new URL(input);
  } catch {}
  // If that fails, try assuming the provided input is an HTTP host
  try {
    return new URL("http://" + input);
  } catch {}
  // If that fails ¯\_(ツ)_/¯
  return null;
}




// async function displayCookies(domain) {
//     let cookies = 0;
//     try {
//         const cookies = await chrome.cookies.getAll({ domain });
    
//         if (cookies.length === 0) {
//           return "No cookies found";
//         }
//         return cookies.length;
//     } catch (error) {
//         return `Unexpected error: ${error.message}`;
//       }
// }

// console.log(displayCookies(stringToUrl(tab.url).hostname));

async function deleteDomainCookies(domain) {
  let cookiesDeleted = 0;
  try {
    const cookies = await chrome.cookies.getAll({ domain });

    if (cookies.length === 0) {
      setCookie(0);
      return "No cookies found";
    }

    let pending = cookies.map(deleteCookie);
    await Promise.all(pending);

    cookiesDeleted = pending.length;
  } catch (error) {
    return `Unexpected error: ${error.message}`;
  }
  setCookie(0);
  return `Deleted ${cookiesDeleted} cookie(s).`;
}



function deleteCookie(cookie) {
  // Cookie deletion is largely modeled off of how deleting cookies works when using HTTP headers.
  // Specific flags on the cookie object like `secure` or `hostOnly` are not exposed for deletion
  // purposes. Instead, cookies are deleted by URL, name, and storeId. Unlike HTTP headers, though,
  // we don't have to delete cookies by setting Max-Age=0; we have a method for that ;)
  //
  // To remove cookies set with a Secure attribute, we must provide the correct protocol in the
  // details object's `url` property.
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Secure
  const protocol = cookie.secure ? "https:" : "http:";

  // Note that the final URL may not be valid. The domain value for a standard cookie is prefixed
  // with a period (invalid) while cookies that are set to `cookie.hostOnly == true` do not have
  // this prefix (valid).
  // https://developer.chrome.com/docs/extensions/reference/cookies/#type-Cookie
  const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;

  return chrome.cookies.remove({
    url: cookieUrl,
    name: cookie.name,
    storeId: cookie.storeId,
  });
}

function setMessage(str) {
  message.textContent = str;
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = "";
}

