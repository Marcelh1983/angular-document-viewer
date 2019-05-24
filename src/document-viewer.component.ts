import { Component, Input, NgZone, OnDestroy, OnChanges, SimpleChanges, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeStyle } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';
import { EventEmitter } from '@angular/core';

@Component({
    selector: 'ngx-doc-viewer',
    template: `<iframe id="iframe" *ngIf="fullUrl" [style]="safeStyle" frameBorder="0" [src]="fullUrl"></iframe> `
})
export class NgxDocViewerComponent implements OnChanges, OnDestroy {

    public fullUrl: SafeResourceUrl;
    public safeStyle: SafeStyle;
    private checkIFrameSubscription: Subscription;
    private configuredViewer = 'google';

    constructor(private domSanitizer: DomSanitizer, private ngZone: NgZone) {
        if (!this.safeStyle) {
            this.safeStyle = this.domSanitizer.bypassSecurityTrustStyle('width:100%;height:50vh;');
        }
    }
    @Output() loaded: EventEmitter<any> = new EventEmitter();
    @Input() url: string;
    @Input() googleCheckInterval = 3000;
    @Input() set style(style: string) {
        this.safeStyle = this.domSanitizer.bypassSecurityTrustStyle(style);
    }
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
        if (changes.url && changes.url.currentValue !== changes.url.previousValue) {
            const u = this.url.indexOf('/') ? encodeURIComponent(this.url) : this.url;
            this.fullUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.configuredViewer === 'google' ?
                `https://docs.google.com/gview?url=${u}&embedded=true` :
                `https://view.officeapps.live.com/op/embed.aspx?src=${u}`);
            // see: https://stackoverflow.com/questions/40414039/google-docs-viewer-returning-204-responses-no-longer-working-alternatives
            // hack to reload iframe if it's not loaded.
            // would maybe be better to use view.officeapps.live.com but seems not to work with sas token.
            if (this.configuredViewer === 'google') {
                this.ngZone.runOutsideAngular(() => {
                    const iframe = document.querySelector('iframe');
                    this.checkIFrame(iframe);
                    // if it's not loaded after the googleIntervalCheck, then open load again.
                    this.checkIFrameSubscription = interval(this.googleCheckInterval)
                        .pipe(
                            take(Math.round(this.googleCheckInterval === 0 ? 0 : 10000 / this.googleCheckInterval)))
                        .subscribe(() => {
                            this.reloadIFrame(iframe);
                        });
                });
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
