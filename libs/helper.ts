// eslint-disable-next-line no-var
declare var mammoth;
import { ViewerType } from './model';

export const fileToArray = (url: string): Promise<ArrayBuffer> => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    try {
      const request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'blob';
      request.onload = () => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(request.response);
        reader.onloadend = () => {
          resolve(reader.result as ArrayBuffer);
        };
      };
      request.send();
    } catch {
      reject(`error while retrieving file ${url}.`);
    }
  });
};

const reloadIFrame = (iframe: HTMLIFrameElement) => {
  if (iframe) {
    console.log('reloading..');
    // eslint-disable-next-line no-self-assign
    iframe.src = iframe.src;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleFileUpload = (fileInput: any) => {
  return new Promise<string>((resolve, reject) => {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const reader = new FileReader();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reader.onload = (e: any) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    } else {
      reject('no files selected');
    }
  });
};

export const getbaseUrl = (): string => {
  const pathArray = window.location.href.split('/');
  const protocol = pathArray[0];
  const host = pathArray[2];
  return protocol + '//' + host;
};

export const getDocxToHtml = async (url: string) => {
  if (!mammoth) {
    console.error(
      'Please install mammoth and make sure mammoth.browser.min.js is loaded.'
    );
  }
  const arrayBuffer = await fileToArray(url);
  const resultObject = await mammoth.convertToHtml({ arrayBuffer });
  return resultObject.value;
};

export const googleCheckSubscription = () => {
  let subscription = null;
  let checkCount = 0;
  return {
    subscribe: (iframe: HTMLIFrameElement, interval = 3000, maxChecks = 3) => {
      if (!iframeLoaded(iframe)) {
        subscription = setInterval(() => {
          checkCount++;
          if (checkCount >= maxChecks) {
            clearInterval(subscription);
          }
          reloadIFrame(iframe);
        }, interval);
        return subscription;
      } else {
        if (subscription) {
          clearInterval(subscription);
        }
      }
    },
    unsubscribe: () => {
      if (subscription) {
        clearInterval(subscription);
      }
    },
  };
};

export const iframeLoaded = (iframe: HTMLIFrameElement) => {
  // its #document <html><head></head><body></body></html> when google is returning a 204
  // so if contentDocument = null then it's loaded.
  let isLoaded = false;
  try {
    if (!internetExplorer()) {
      isLoaded = !iframe.contentDocument;
    } else {
      isLoaded = !iframe.contentWindow.document;
    }
  } catch {
    // ignore message Blocked a frame with origin "http://..." from accessing a cross-origin frame.
  }
  return isLoaded;
}

const internetExplorer = () =>
  (/MSIE (\d+\.\d+);/.test(navigator.userAgent) || navigator.userAgent.indexOf("Trident/") > -1);

export const getViewerDetails = (
  url: string,
  configuredViewer: ViewerType = 'google',
  queryParams = '',
  viewerUrl = null
) => {
  switch (configuredViewer) {
    case 'google':
      viewerUrl = `https://docs.google.com/gview?url=%URL%&embedded=true`;
      break;
    case 'office': {
      viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=%URL%`;
      break;
    }
    case 'pdf': {
      viewerUrl = null;
      break;
    }
  }
  const externalViewer =
    configuredViewer === 'google' ||
    configuredViewer === 'office' ||
    configuredViewer === 'url';

  const u = url.indexOf('/') ? encodeURIComponent(url) : url;
  let fullUrl = viewerUrl ? viewerUrl.replace('%URL%', u) : url;
  if (queryParams && externalViewer && configuredViewer !== 'url') {
    const start = queryParams.startsWith('&') ? '' : '&';
    fullUrl = `${fullUrl}${start}${queryParams}`;
  }
  return {
    url: fullUrl,
    externalViewer,
  };
};
