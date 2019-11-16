

# ngx-doc-viewer

This component uses google document viewer or the office365 viewer to show documents.

<a href="https://angular-doc-viewer.firebaseapp.com/">View demo</a>

<a href="https://github.com/Marcelh1983/angular-document-viewer/blob/master/changelog.md">Changes</a>

### Install the NPM Module
```sh
npm install ngx-doc-viewer --save
```
### Usage

#### 1. Import `NgxDocViewerModule` 

```ts
@NgModule({
    imports: [NgxDocViewerModule]
  })
  export class AppModule { }
```

#### 2. Add DocViewer to component:

```html
    <ngx-doc-viewer [url]="doc" viewer="google" style="width:100%;height:50vh;"></ngx-doc-viewer>
```

#### API:

Input: 
- url: document url.
- viewer: google or office
- style

Output:
- loaded: google only, notifies when iframe is loaded. Can be used to show progress while loading

### File type support

#### office viewer
.ppt, .pptx, .doc, .docx, .xls and .xlsx

#### google viewer

Only files under 25 MB can be previewed with the Google Drive viewer.

Google Drive viewer helps you preview over 15 different file types, listed below:

* Text files (.TXT)
* Markup/Code (.CSS, .HTML, .PHP, .C, .CPP, .H, .HPP, .JS)
* Microsoft Word (.DOC and .DOCX)
* Microsoft Excel (.XLS and .XLSX)
* Microsoft PowerPoint (.PPT and .PPTX)
* Adobe Portable Document Format (.PDF)
* Apple Pages (.PAGES)
* Adobe Illustrator (.AI)
* Adobe Photoshop (.PSD)
* Tagged Image File Format (.TIFF)
* Autodesk AutoCad (.DXF)
* Scalable Vector Graphics (.SVG)
* PostScript (.EPS, .PS)
* TrueType (.TTF)
* XML Paper Specification (.XPS)
* Archive file types (.ZIP and .RAR)

<a href="https://gist.githubusercontent.com/tzmartin/1cf85dc3d975f94cfddc04bc0dd399be/raw/d4263c8faf7b68f4bbfd33b386ec33ed2bc11e7d/embedded-file-viewer.md">Source</a>

