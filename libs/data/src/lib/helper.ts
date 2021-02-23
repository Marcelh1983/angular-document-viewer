// eslint-disable-next-line no-var
declare var mammoth;
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { ViewerType } from '..';

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
}

const reloadIFrame = (iframe: HTMLIFrameElement) => {
    if (iframe) {
        console.log('reloading..');
        // eslint-disable-next-line no-self-assign
        iframe.src = iframe.src;
    }
}

export const getbaseUrl = (): string => {
    const pathArray = window.location.href.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    return protocol + '//' + host;
};

export const getDocxToHtml = async (url: string) => {
    if (!mammoth) {
        console.error('Please install mammoth and make sure mammoth.browser.min.js is loaded.');
    }
    const arrayBuffer = await fileToArray(url);
    const resultObject = await mammoth.convertToHtml({ arrayBuffer });
    return resultObject.value;
}

export const googleCheckSubscription = (iframe: HTMLIFrameElement, googleCheckInterval = 3000) => {
    return timer(100, googleCheckInterval)
        .pipe(
            take(Math.round(googleCheckInterval === 0 ? 0 : 20000 / googleCheckInterval)))
        .subscribe(() => {
            reloadIFrame(iframe);
        });
}

export const getViewerDetails = (url: string, configuredViewer: ViewerType = 'google', queryParams = '', viewerUrl = null) => {
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
    const externalViewer = configuredViewer === 'google' || configuredViewer === 'office' ||
        configuredViewer === 'url';

    const u = url.indexOf('/') ? encodeURIComponent(url) : url;
    let fullUrl = viewerUrl ? viewerUrl.replace('%URL%', u) : url;
    if (!!queryParams && configuredViewer !== 'pdf' && configuredViewer !== 'url') {
        const start = queryParams.startsWith('&') ? '' : '&';
        fullUrl = `${fullUrl}${start}${queryParams}`;
    }
    return {
        url: fullUrl,
        externalViewer
    }
}