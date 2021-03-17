import {
  Component,
  Input,
  NgZone,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Output,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventEmitter } from '@angular/core';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  getDocxToHtml,
  getViewerDetails,
  googleCheckSubscription,
  iframeLoaded
} from './../../../helper';
import {
  IFrameReloader
} from './../../../model';
// eslint-disable-next-line @typescript-eslint/naming-convention
export type viewerType = 'google' | 'office' | 'mammoth' | 'pdf' | 'url';
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ngx-doc-viewer',
  templateUrl: 'document-viewer.component.html',
  styles: [
    `
      :host {
        display: block;
      }
      .container {
        width: 100%;
        height: 100%;
        position: relative;
      }
      .overlay-popout-google {
        width: 40px;
        height: 40px;
        right: 26px;
        top: 11.5px;
        position: absolute;
        z-index: 1000;
      }
      .overlay-popout-office {
        width: 100px;
        height: 20px;
        right: 0;
        bottom: 0;
        position: absolute;
        z-index: 1000;
      }
      .overlay-full {
        width: 100%;
        height: 100%;
        right: 0;
        top: 0;
        position: absolute;
        z-index: 1000;
      }
      iframe {
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class NgxDocViewerComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Output() loaded: EventEmitter<void> = new EventEmitter();
  @Input() url = '';
  @Input() queryParams = '';
  @Input() viewerUrl = '';
  @Input() googleCheckInterval = 3000;
  @Input() disableContent: 'none' | 'all' | 'popout' | 'popout-hide' = 'none';
  @Input() googleCheckContentLoaded = true;
  @Input() viewer: viewerType;
  @ViewChildren('iframe') iframes: QueryList<ElementRef>;

  public fullUrl: SafeResourceUrl = null;
  public externalViewer = false;
  public docHtml = '';
  public configuredViewer: viewerType = 'google';
  private checkIFrameSubscription: IFrameReloader;
  private shouldCheckIframe = false;

  constructor(private domSanitizer: DomSanitizer, private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    if (this.shouldCheckIframe) {
      const iframe = this.iframes?.first
        ?.nativeElement as HTMLIFrameElement;
      if (iframe) {
        this.shouldCheckIframe = false;
        this.reloadIframe(iframe);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.checkIFrameSubscription) {
      this.checkIFrameSubscription.unsubscribe();
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (
      changes &&
      changes.viewer &&
      (changes.viewer.isFirstChange ||
        changes.viewer.currentValue !== changes.viewer.previousValue)
    ) {
      if (
        this.viewer !== 'google' &&
        this.viewer !== 'office' &&
        this.viewer !== 'mammoth' &&
        this.viewer !== 'pdf' &&
        this.viewer !== 'url'
      ) {
        console.error(
          `Unsupported viewer: '${this.viewer}'. Supported viewers: google, office, mammoth and pdf`
        );
      }
      this.configuredViewer = this.viewer;
    }

    if (
      (changes.url && changes.url.currentValue !== changes.url.previousValue) ||
      (changes.viewer &&
        changes.viewer.currentValue !== changes.viewer.previousValue) ||
      (changes.viewerUrl &&
        changes.viewerUrl.currentValue !== changes.viewerUrl.previousValue)
    ) {
      const viewerDetails = getViewerDetails(
        this.url,
        this.configuredViewer,
        this.queryParams,
        this.viewerUrl
      );

      this.externalViewer = viewerDetails.externalViewer;
      this.docHtml = '';
      if (this.checkIFrameSubscription) {
        this.checkIFrameSubscription.unsubscribe();
      }
      if (!this.url) {
        this.fullUrl = null;
      } else if (
        viewerDetails.externalViewer ||
        this.configuredViewer === 'url'
      ) {
        this.fullUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
          viewerDetails.url
        );
        // see:
        // https://stackoverflow.com/questions/40414039/google-docs-viewer-returning-204-responses-no-longer-working-alternatives
        // hack to reload iframe if it's not loaded.
        // would maybe be better to use view.officeapps.live.com but seems not to work with sas token.
        if (
          this.configuredViewer === 'google' &&
          this.googleCheckContentLoaded
        ) {
          this.ngZone.runOutsideAngular(() => {
            // if it's not loaded after the googleIntervalCheck, then open load again.
            const iframe = this.iframes?.first
              ?.nativeElement as HTMLIFrameElement;
            if (iframe) {
              this.reloadIframe(iframe);
            } else {
              this.shouldCheckIframe = true;
            }
          });
        }
      } else if (this.configuredViewer === 'mammoth') {
        this.docHtml = await getDocxToHtml(this.url);
      }
    }
  }

  private reloadIframe(iframe: HTMLIFrameElement) {
    this.checkIFrameSubscription = googleCheckSubscription();
    this.checkIFrameSubscription.subscribe(
      iframe,
      this.googleCheckInterval
    );
  }

  iframeLoaded() {
    const iframe = this.iframes?.first
      ?.nativeElement as HTMLIFrameElement;
    if (iframe && iframeLoaded(iframe)) {
      this.loaded.emit(null);
      if (this.checkIFrameSubscription) {
        this.checkIFrameSubscription.unsubscribe();
      }
    }
  }
}
