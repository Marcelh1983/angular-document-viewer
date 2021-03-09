import React, { useEffect, useRef, useState } from 'react';
import {
  googleCheckSubscription,
  getViewerDetails,
  getDocxToHtml,
} from './../../../helper';

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
  externalViewer: boolean;
  docHtml: { __html: string };
}

export const DocumentViewer = (props: Props) => {
  // props = { ...defaultProps, ...props };
  const iframeRef = useRef(null);

  const [state, setState] = useState({
    url: '',
    externalViewer: true,
    docHtml: { __html: '' },
  } as State);
  const checkIFrameSubscription = useRef({
    subscribe: (iframe: HTMLIFrameElement, interval = 3000, maxChecks = 5) => {
      //
    },
    unsubscribe: () => {
      //
    },
  });

  useEffect(() => {
    const details = getViewerDetails(
      props.url,
      props.viewer,
      props.queryParams,
      props.viewerUrl
    );
    setState({
      url: details.url,
      externalViewer: details.externalViewer,
      docHtml: { __html: '' },
    });
    if (iframeRef && iframeRef.current) {
      const iframe = iframeRef.current;
      if (checkIFrameSubscription && checkIFrameSubscription.current) {
        checkIFrameSubscription.current.unsubscribe();
      }
      const intervalRef = googleCheckSubscription();
      intervalRef.subscribe(iframe, props.googleCheckInterval);
      checkIFrameSubscription.current = intervalRef;
    } else if (props.viewer === 'mammoth') {
      const setHtml = async () => {
        const docHtml = { __html: await getDocxToHtml(details.url) };
        setState({
          url: '',
          docHtml,
          externalViewer: false,
        });
      };
      setHtml();
    }
  }, [props]);

  const iframeLoaded = () => {
    if (props.loaded) props.loaded();
    if (checkIFrameSubscription.current) {
      checkIFrameSubscription.current.unsubscribe();
    }
  };

  return state.externalViewer ? (
    <iframe
      style={iframeStyle}
      ref={iframeRef}
      onLoad={() => {
        iframeLoaded();
      }}
      id="iframe"
      title="iframe"
      frameBorder="0"
      src={state.url}
    ></iframe>
  ) : props.viewer !== 'pdf' ? (
    <div dangerouslySetInnerHTML={state.docHtml}></div>
  ) : state.url ? (
    <object data={state.url} type="application/pdf" width="100%" height="100%">
      <p>
        Your browser does not support PDFs.
        <a href={state.url}>Download the PDF</a>.
      </p>
    </object>
  ) : null;
};
