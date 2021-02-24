import React, { useEffect, useRef, useState } from 'react';
import { Subscription, timer } from 'rxjs';
import {
  googleCheckSubscription,
  getViewerDetails,
  getDocxToHtml,
} from '@documentviewer/data';

const iframeStyle = {
  width: '100%',
  height: '100%',
};

export type viewerType = 'google' | 'office' | 'mammoth' | 'pdf' | 'url';

interface Props {
  loaded?: () => void;
  url: string;
  queryParams?: string;
  viewerUrl?: string;
  googleCheckInterval?: number;
  disableContent?: 'none' | 'all' | 'poput' | 'popout-hide';
  googleCheckContentLoaded?: boolean;
  viewer?: viewerType;
}

const defaultProps: Props = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loaded: () => {},
  disableContent: 'none',
  googleCheckContentLoaded: true,
  googleCheckInterval: 3000,
  queryParams: '',
  url: '',
  viewer: 'google',
  viewerUrl: '',
};

interface State {
  url: string;
  isloaded: boolean;
}

export const DocumentViewer = (props: Props) => {
  props = { ...defaultProps, ...props };
  const iframeRef = useRef(null);
  let checkIFrameSubscription: Subscription;
  const [url, setUrl] = useState('');
  const [externalViewer, setExternalViewer] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [docHtml, setDocHtml] = useState(null);

  useEffect(() => {
    const details = getViewerDetails(
      props.url,
      props.viewer,
      props.queryParams,
      props.viewerUrl
    );
    setUrl(details.url);
    setExternalViewer(details.externalViewer);
    if (iframeRef && iframeRef.current) {
      const iframe = iframeRef.current;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (!loaded) {
        checkIFrameSubscription = googleCheckSubscription(
          iframe,
          props.googleCheckInterval
        );
      }
    } else if (props.viewer === 'mammoth') {
      const setHtml = async () => {
        setDocHtml({__html: await getDocxToHtml(url) });
      };
      setHtml();
    }
  }, [props]);

  const iframeLoaded = () => {
    props.loaded();
    if (checkIFrameSubscription) {
      checkIFrameSubscription.unsubscribe();
    }
  };

  return externalViewer ? (
    <iframe
      style={iframeStyle}
      ref={iframeRef}
      onLoad={() => {
        console.log('loaded.');
        setLoaded(true);
        iframeLoaded();
      }}
      id="iframe"
      title="iframe"
      frameBorder="0"
      src={url}
    ></iframe>
  ) : props.viewer !== 'pdf' ? (
    <div dangerouslySetInnerHTML={docHtml}></div>
  ) : (
    url ? <object data={url} type="application/pdf" width="100%" height="100%">
      <p>
        Your browser does not support PDFs.
        <a href={url}>Download the PDF</a>.
      </p>
    </object> : null
  );
};
