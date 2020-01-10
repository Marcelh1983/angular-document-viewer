import { Component, ViewChild } from '@angular/core';
import { viewerType } from 'modules/document-viewer.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent {
  viewers: { name: viewerType, docs: string[], custom: boolean, upload: boolean }[] = [
    {
      name: 'google', docs: [
        'https://file-examples.com/wp-content/uploads/2017/02/file-sample_100kB.docx',
        'https://file-examples.com/wp-content/uploads/2017/02/file_example_XLSX_10.xlsx',
        'https://file-examples.com/wp-content/uploads/2017/10/file_example_TIFF_1MB.tiff',
        'https://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf',
        'https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_250kB.ppt'
      ], custom: true, upload: false
    },
    {
      name: 'office', docs: [
        'https://file-examples.com/wp-content/uploads/2017/02/file-sample_100kB.docx',
        'https://file-examples.com/wp-content/uploads/2017/02/file_example_XLSX_10.xlsx',
        'https://file-examples.com/wp-content/uploads/2017/10/file_example_TIFF_1MB.tiff',
        'https://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf',
        'https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_250kB.ppt'
      ], custom: true, upload: false
    },
    {
      name: 'mammoth', docs: [
        `${window.location.href}/assets/file-sample_100kB.docx`
      ], custom: false, upload: true
    }
  ];
  selectedViewer = this.viewers[0];
  selectedDoc = this.selectedViewer.docs[0];

  constructor() { }
  selectViewer(viewerName: viewerType) {
    if (viewerName !== this.selectViewer.name) {
      this.selectedViewer = this.viewers.find(v => v.name === viewerName);
      this.selectedDoc = this.selectedViewer.docs[0];
    }
  }

  getDocExtension(doc: string) {
    const splittedDoc = doc.split('.');
    return splittedDoc[splittedDoc.length - 1];
  }

  handleFiles(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.selectedDoc = e.target.result;
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }
}
