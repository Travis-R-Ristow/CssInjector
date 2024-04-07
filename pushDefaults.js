const getPageSpecificURL = (url) => {
  const hasParams = url.indexOf('?');
  const hasDiv = url.indexOf('#');

  let pageURL = hasParams > 0 ? url.substring(0, hasParams) : url;
  pageURL = hasDiv > 0 ? url.substring(0, hasDiv) : pageURL;

  return pageURL;
};

const pushForAllSites = async () => {
  chrome.storage.sync.get('all-sites', (data = {}) => {
    const css = data['all-sites'];
    if (css) {
      const styles = document.createElement('style');
      styles.innerHTML = css;
      document.body.append(styles);
    }
  });
};

const pushForDomainURLs = async (url) => {
  const domainSpecificURL = url.substring(
    0,
    url.indexOf('/', 'https://'.length)
  );

  chrome.storage.sync.get([domainSpecificURL], (data = {}) => {
    const css = data[domainSpecificURL];
    if (css) {
      const styles = document.createElement('style');
      styles.innerHTML = css;
      document.body.append(styles);
    }
  });
};

const pushForPageURLs = async (url) => {
  const pageSpecificURL = getPageSpecificURL(url);

  chrome.storage.sync.get([pageSpecificURL], (data = {}) => {
    const css = data[pageSpecificURL];
    if (css) {
      const styles = document.createElement('style');
      styles.innerHTML = css;
      document.body.append(styles);
    }
  });
};

const pushDefaults = (async () => {
  const url = window.location.href;

  pushForAllSites();
  pushForDomainURLs(url);
  pushForPageURLs(url);
})();
