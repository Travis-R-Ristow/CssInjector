document.getElementById('fire-css-btn').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    css: getCssById('css')
  });
});

document
  .getElementById('url-specific-checkbox')
  .addEventListener('click', async ({ target: { checked } }) => {
    const [{ url }] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
    const domainSpecificURL = url.substring(0, url.indexOf('/', 8));
    const pageSpecificURL = getPageSpecificURL(url);

    if (checked) {
      document.getElementById('url-specific-title').innerText =
        'Domain Specific';
      document.getElementById('active-url').value = domainSpecificURL;
    } else {
      document.getElementById('url-specific-title').innerText = 'Page Specific';
      document.getElementById('active-url').value = pageSpecificURL;
    }
  });

document.getElementById('save-css-btn').addEventListener('click', async () => {
  const data = {};
  const css = getCssById('save-css');
  const url = document.getElementById('active-url').value;
  const saveTo = url;

  data[saveTo] = css;

  chrome.storage.sync.set(data);
});

document
  .getElementById('clear-storage-btn')
  .addEventListener(
    'click',
    async () =>
      confirm('Are you sure you want to clear all saved styles?') &&
      chrome.storage.sync.clear(() => console.log('Storage Cleared!'))
  );

const renderSavedStyles = async () => {
  const styles = document.getElementById('saved-styles-list');
  styles.innerHTML = '';
  const data = await chrome.storage.sync.get().then((data) => data);

  if (!Object.entries(data).length) {
    styles.innerHTML = '';
  }

  for (const key in data) {
    const site = document.createElement('li');
    site.style.lineHeight = '1.75rem';
    site.innerText = key;

    const deleteBtn = document.createElement('button');
    deleteBtn.style.float = 'right';
    deleteBtn.onclick = async () => {
      if (confirm('Are you sure you want to delete css for `' + key + '` ?')) {
        await chrome.storage.sync.remove(key);
      }
    };
    deleteBtn.innerText = 'Delete';

    const editBtn = document.createElement('button');
    editBtn.style.float = 'right';
    editBtn.onclick = async () => {
      document.getElementById('active-url').value = key;
      document.getElementById('save-css').value = data[key];
    };
    editBtn.innerText = 'Edit';

    site.appendChild(deleteBtn);
    site.appendChild(editBtn);
    styles.appendChild(site);
  }
};

// HELPER FUNCTIONS
const getPageSpecificURL = (url) => {
  const hasParams = url.indexOf('?');
  const hasDiv = url.indexOf('#');

  let pageURL = hasParams > 0 ? url.substring(0, hasParams) : url;
  pageURL = hasDiv > 0 ? url.substring(0, hasDiv) : pageURL;

  return pageURL;
};

const updateApp = async () => {
  await chrome.storage.onChanged.addListener(async () => {
    await renderSavedStyles();
  });
};

const getCssById = (id) => {
  let css = document.getElementById(id).value;
  const useInjectImportant =
    document.getElementById('inject-important').checked;
  if (useInjectImportant) {
    css = css.replaceAll(/(?<!!important);/gm, ' !important;');
  }

  return css;
};

// PUSH DEFAULT
const setDefaultURL = async () => {
  const [{ url }] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const pageSpecificURL = getPageSpecificURL(url);

  document.getElementById('active-url').value = pageSpecificURL;
};

const applyCSS = async () => {
  const [{ url, id }] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const pageSpecificURL = getPageSpecificURL(url);
  const domainSpecificURL = url.substring(0, url.indexOf('/', 8));

  chrome.storage.sync.get([domainSpecificURL], (data) => {
    const css = data[domainSpecificURL];
    if (css) {
      chrome.scripting.insertCSS({
        target: { tabId: id },
        css: css
      });
    }
  });

  chrome.storage.sync.get([pageSpecificURL], (data) => {
    const css = data[pageSpecificURL];
    if (css) {
      chrome.scripting.insertCSS({
        target: { tabId: id },
        css: css
      });
    }
  });
};

const setDefaults = (async () => {
  await setDefaultURL();
  await applyCSS();
  await renderSavedStyles();
  await updateApp();
})();
