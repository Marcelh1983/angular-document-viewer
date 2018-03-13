import { Component, Input, EventEmitter, Output, AfterViewInit, NgZone, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeResourceUrl, SafeStyle } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'ngx-doc-viewer',
    template: `<iframe id="iframe" *ngIf="fullUrl" [style]="safeStyle" frameBorder="0" [src]="fullUrl"></iframe> `
})
export class NgxDocViewerComponent implements OnInit, AfterViewInit {

    public fullUrl: SafeResourceUrl;
    public safeStyle: SafeStyle;
    private configuredViewer = "google";

    constructor(private domSanitizer: DomSanitizer, private ngZone: NgZone) {
        if (!this.safeStyle) {
            this.safeStyle = this.domSanitizer.bypassSecurityTrustStyle('width:100%;height:50vh;');
        }
    }

    @Input() url: string;
    @Input() set style(style: string) {
        this.safeStyle = this.domSanitizer.bypassSecurityTrustStyle(style);
    }
    @Input() set viewer(viewer: string) {
        const v = viewer.toLowerCase().trim();
        if (v !== 'google' && v !== 'office') {
            console.error(`Unsupported viewer: '${viewer}'. Supported viewers: google, office`);
        };
        this.configuredViewer = v;
    }

    ngOnInit(): void {
        const u = this.url.indexOf('/') ? encodeURIComponent(this.url) : this.url;
        this.fullUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.configuredViewer === 'google' ?
            `https://docs.google.com/gview?url=${u}&embedded=true` :
            `https://view.officeapps.live.com/op/embed.aspx?src=${u}`);
    }

    ngAfterViewInit(): void {
        // see: https://stackoverflow.com/questions/40414039/google-docs-viewer-returning-204-responses-no-longer-working-alternatives
        // hack to reload iframe if it's not loaded.
        // would maybe be better to use view.officeapps.live.com but seems not to work with sas token.
        if (this.configuredViewer === "google") {
            this.ngZone.runOutsideAngular(() => {
                let iFrameInHtml = false;
                const timerId = setInterval(() => {
                    iFrameInHtml = !!document.querySelector('iframe');
                    if (iFrameInHtml) {
                        clearInterval(timerId);
                        this.checkIFrame();
                    }
                }, 200);
            });
        }
    }

    checkIFrame() {
        const iframe = document.querySelector('iframe');
        const timerId = setInterval(() => this.reloadIFrame(iframe), 2000);
        if (iframe) {
            iframe.onload = () => clearInterval(timerId);
        }
    }

    reloadIFrame(iframe: HTMLIFrameElement) {
        if (iframe) {
            console.log('reloading..');
            iframe.src = iframe.src;
        }
    }
}