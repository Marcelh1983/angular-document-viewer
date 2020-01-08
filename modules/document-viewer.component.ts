import { Component, Input, NgZone, OnDestroy, OnChanges, SimpleChanges, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';
import { EventEmitter } from '@angular/core';

@Component({
    selector: 'ngx-doc-viewer',
    template: `
        <iframe *ngIf="fullUrl && disableContent === 'none'" id="iframe" frameBorder="0" [src]="fullUrl"></iframe>
        <div class="container" *ngIf="disableContent !== 'none'">
            <div
                [class.overlay-full]="disableContent === 'all'"
                [class.overlay-popout]="disableContent === 'popout' || disableContent === 'popout-hide'"
                [style.background-color]="disableContent === 'popout-hide' ? '#fff': 'transparent'"
            >
            </div>
            <iframe *ngIf="fullUrl" id="iframe"  frameBorder="0" [src]="fullUrl"></iframe>
        </div>
    `,
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
    private checkIFrameSubscription: Subscription = null;
    private configuredViewer = 'google';

    constructor(private domSanitizer: DomSanitizer, private ngZone: NgZone) { }
    @Output() loaded: EventEmitter<any> = new EventEmitter();
    @Input() url = '';
    @Input() googleCheckInterval = 3000;
    @Input() disableContent: 'none' | 'all' | 'popout' | 'popout-hide' = 'none';
    @Input() googleCheckContentLoaded = true;
    @Input() set viewer(viewer: string) {
        const v = viewer.toLowerCase().trim();
        if (v !== 'google' && v !== 'office') {
            console.error(`Unsupported viewer: '${viewer}'. Supported viewers: google, office`);
        }
        this.configuredViewer = v;
    }
    ngOnDestroy(): void {
        if (this.checkIFrameSubscription) {
            this.checkIFrameSubscription.unsubscribe();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes.url && changes.url.currentValue !== changes.url.previousValue) ||
            changes.viewer && changes.viewer.currentValue !== changes.viewer.previousValue) {
            if (this.checkIFrameSubscription) {
                this.checkIFrameSubscription.unsubscribe();
            }
            if (!this.url) {
                this.fullUrl = null;
            } else {
                const u = this.url.indexOf('/') ? encodeURIComponent(this.url) : this.url;
                this.fullUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.configuredViewer === 'google' ?
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
}
