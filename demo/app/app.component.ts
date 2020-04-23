import { Component, ViewChild } from '@angular/core';
import { viewerType } from 'modules/document-viewer.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})
export class AppComponent {
  viewers: { name: viewerType, docs: string[], custom: boolean, acceptedUploadTypes: string, viewerUrl?: string }[] = [
    {
      name: 'google', docs: [
        'https://file-examples.com/wp-content/uploads/2017/02/file-sample_100kB.docx',
        'https://file-examples.com/wp-content/uploads/2017/02/file_example_XLSX_10.xlsx',
        'https://file-examples.com/wp-content/uploads/2017/10/file_example_TIFF_1MB.tiff',
        'https://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf',
        'https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_250kB.ppt'
      ], custom: true, acceptedUploadTypes: null
    },
    {
      name: 'office', docs: [
        'https://file-examples.com/wp-content/uploads/2017/02/file-sample_100kB.docx',
        'https://file-examples.com/wp-content/uploads/2017/02/file_example_XLSX_10.xlsx',
        'https://file-examples.com/wp-content/uploads/2017/10/file_example_TIFF_1MB.tiff',
        'https://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf',
        'https://file-examples.com/wp-content/uploads/2017/08/file_example_PPT_250kB.ppt'
      ], custom: true, acceptedUploadTypes: null
    },
    {
      name: 'mammoth', docs: [
        `${window.location.href}/assets/file-sample_100kB.docx`
      ], custom: false, acceptedUploadTypes: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    },
    {
      name: 'pdf', docs: [
        `${window.location.href}/assets/file-sample_150kB.pdf`
      ], custom: false, acceptedUploadTypes: 'application/pdf'
    },
    {
      name: 'url', docs: [
        `https://docs.google.com/document/d/e/2PACX-1vRs3gemrszDinuGJCi_wO2m5XVP1q2SlRhxM8PAUYc3wu9LFsvteny7l6Rkp695-ruhfn3gWXV03yXC/pub?embedded=true`
      ], custom: false, acceptedUploadTypes: null
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
