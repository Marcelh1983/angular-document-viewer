import { Component, Input, NgZone, OnDestroy, OnChanges, SimpleChanges, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';
import { EventEmitter } from '@angular/core';

declare var mammoth;

export type viewerType = 'google' | 'office' | 'mammoth' | 'pdfjs';
@Component({
    selector: 'ngx-doc-viewer',
    templateUrl: 'document-viewer.component.html',
    styles: [`:host {
        display: block;
    }
    .container {
        width: 100%;
        height: 100%;
        position: relative;
    }
    .overlay-popout {
        width: 40px;
        height: 40px;
        right: 26px;
        top: 11.5px;
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
    `]
})
export class NgxDocViewerComponent implements OnChanges, OnDestroy {
    public fullUrl: SafeResourceUrl = null;
    public externalViewer = false;
    public docHtml = '';
    private checkIFrameSubscription: Subscription = null;
    private configuredViewer: viewerType = 'google';

    constructor(private domSanitizer: DomSanitizer, private ngZone: NgZone) { }
    @Output() loaded: EventEmitter<any> = new EventEmitter();
    @Input() url = '';
    @Input() googleCheckInterval = 3000;
    @Input() disableContent: 'none' | 'all' | 'popout' | 'popout-hide' = 'none';
    @Input() googleCheckContentLoaded = true;
    @Input() set viewer(viewer: viewerType) {
        if (viewer !== 'google' && viewer !== 'office' && viewer !== 'mammoth') {
            console.error(`Unsupported viewer: '${viewer}'. Supported viewers: google, office and mammoth`);
        }
        if (viewer === 'mammoth') {
            if (mammoth === null) {
                console.error('please install mammoth when using local viewer');
            }
        }
        this.configuredViewer = viewer;
    }
    ngOnDestroy(): void {
        if (this.checkIFrameSubscription) {
            this.checkIFrameSubscription.unsubscribe();
        }
    }

    async ngOnChanges(changes: SimpleChanges): Promise<void> {
        if ((changes.url && changes.url.currentValue !== changes.url.previousValue) ||
            changes.viewer && changes.viewer.currentValue !== changes.viewer.previousValue) {
            this.docHtml = '';
            this.externalViewer = this.configuredViewer === 'google' || this.configuredViewer === 'office';
            if (this.checkIFrameSubscription) {
                this.checkIFrameSubscription.unsubscribe();
            }
            if (!this.url) {
                this.fullUrl = null;
            } else if (this.configuredViewer === 'office' || this.configuredViewer === 'google') {
                const u = this.url.indexOf('/') ? encodeURIComponent(this.url) : this.url;
                this.fullUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
                    this.configuredViewer === 'google' ?
                        `https://docs.google.com/gview?url=${u}&embedded=true` :
                        `https://view.officeapps.live.com/op/embed.aspx?src=${u}`);
                // see:
                // https://stackoverflow.com/questions/40414039/google-docs-viewer-returning-204-responses-no-longer-working-alternatives
                // hack to reload iframe if it's not loaded.
                // would maybe be better to use view.officeapps.live.com but seems not to work with sas token.
                if (this.configuredViewer === 'google' && this.googleCheckContentLoaded) {
                    this.ngZone.runOutsideAngular(() => {
                        let iframe = document.querySelector('iframe');
                        this.checkIFrame(iframe);
                        // if it's not loaded after the googleIntervalCheck, then open load again.
                        this.checkIFrameSubscription = interval(this.googleCheckInterval)
                            .pipe(
                                take(Math.round(this.googleCheckInterval === 0 ? 0 : 20000 / this.googleCheckInterval)))
                            .subscribe(() => {
                                if (iframe == null) {
                                    iframe = document.querySelector('iframe');
                                    this.checkIFrame(iframe);
                                }
                                this.reloadIFrame(iframe);
                            });
                    });
                }
            } else if (this.configuredViewer === 'mammoth') {
                this.docHtml = await this.getDocxToHtml(this.url);
            }
        }
    }
    checkIFrame(iframe: HTMLIFrameElement) {
        if (iframe) {
            iframe.onload = () => {
                this.loaded.emit(null);
                if (this.checkIFrameSubscription) {
                    this.checkIFrameSubscription.unsubscribe();
                }
            };
        }
    }

    reloadIFrame(iframe: HTMLIFrameElement) {
        if (iframe) {
            console.log('reloading..');
            iframe.src = iframe.src;
        }
    }

    private async getDocxToHtml(url: string) {
        const arrayBuffer = await this.fileToArray(url);
        const resultObject = await mammoth.convertToHtml({ arrayBuffer });
        return resultObject.value;
    }

    private fileToArray(url: string): Promise<ArrayBuffer> {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            try {
                const request = new XMLHttpRequest();
                request.open('GET', url, true);
                request.responseType = 'blob';
                request.onload = () => {
                    const reader = new FileReader();
                    reader.readAsArrayBuffer(request.response);
                    reader.onloadend = (e) => {
                        resolve(reader.result as ArrayBuffer);
                    };
                };
                request.send();
            } catch {
                reject(`error while retrieving file ${url}.`);
            }
        });
    }
}
