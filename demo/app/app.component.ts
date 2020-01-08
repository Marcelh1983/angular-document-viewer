import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div style="text-align:center">
    <div class="d-flex">
      <button [class.active]="viewer === 'google'" class="btn btn-outline-primary m-2" (click)="viewer = 'google'">Google viewer</button>
      <button [class.active]="viewer === 'office'" class="btn btn-outline-primary m-2" (click)="viewer = 'office'">Office viewer</button>
    </div>
      <div class="d-flex">
        <button [class.active]="selectedType === 'docx'" class="btn btn-outline-secondary m-2"
         (click)="setDocLocation('docx')">.docx</button>
        <button [class.active]="selectedType === 'xslx'" class="btn btn-outline-secondary m-2"
         (click)="setDocLocation('xslx')">.xslx</button>
        <button [class.active]="selectedType === 'ppt'" class="btn btn-outline-secondary m-2"
         (click)="setDocLocation('ppt')">.ppt</button>
        <ng-container *ngIf="viewer === 'google'">
          <button [class.active]="selectedType === 'tiff'" class="btn btn-outline-secondary m-2"
           (click)="setDocLocation('tiff')">.tiff</button>
          <button [class.active]="selectedType === 'pdf'"class="btn btn-outline-secondary m-2"
           (click)="setDocLocation('pdf')">.pdf</button>
        </ng-container>
        <input class="form-control w-100 m-2" type="text" placeholder="your document url" #input>
        <button class="btn btn-outline-secondary m-2" (click)="doc = input.value; selectedType = ''">Go</button>
      </div>
      <ngx-doc-viewer [url]="doc" [viewer]="viewer" style="width:100%;height:80vh;"></ngx-doc-viewer>
    </div>
  `,
  styles: []
})
export class AppComponent {
  viewer = 'google';
  selectedType = 'docx';
  doc = 'https://file-examples.com/wp-content/uploads/2017/02/file-sample_100kB.docx';

  setDocLocation(type: string) {
    this.selectedType = type;
    switch (type) {
      case 'docx':
        this.doc = 'https://file-examples.com/wp-content/uploads/2017/02/file-sample_100kB.docx';
        break;
      case 'xslx':
        this.doc = 'https://file-examples.com/wp-content/uploads/2017/02/file_example_XLSX_10.xlsx';
        break;
      case 'tiff':
        this.doc = 'https://file-examples.com/wp-content/uploads/2017/10/file_example_TIFF_1MB.tiff';
        break;
      case 'pdf':
        this.doc = 'https://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf';
        break;
      case 'ppt':
        this.doc = 'https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_250kB.ppt';
        break;
    }
  }

}
