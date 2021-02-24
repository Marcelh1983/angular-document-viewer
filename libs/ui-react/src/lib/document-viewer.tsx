import React, { useEffect, useRef, useState } from 'react';
import { Subscription, timer } from 'rxjs';
import { googleCheckSubscription, getViewerDetails } from '@documentviewer/data';

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
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const details = getViewerDetails(props.url, props.viewer, props.queryParams, props.viewerUrl);
    setUrl(details.url);
    if (iframeRef && iframeRef.current) {
      const iframe = iframeRef.current;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (!loaded) {
        checkIFrameSubscription =  googleCheckSubscription(iframe, props.googleCheckInterval);
      }
    }
  }, []);

  const iframeLoaded = () => {
    props.loaded();
    if (checkIFrameSubscription) {
      checkIFrameSubscription.unsubscribe();
    }
  };

  return (
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
  );
};
