

# ngx-doc-viewer

This component uses google document viewer or the office365 viewer to show documents.
Documents should be publicly available. The files can have a shared access signature (SAS) though I had some problems with these SAS tokens in combination with the Office viewer. So local files and blobs/ObjectUrls are not supported.

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


There are some issues loading document in the google viewer. See: https://stackoverflow.com/questions/40414039/google-docs-viewer-returning-204-responses-no-longer-working-alternatives. If loading pdf's and Word documents, seems to work now with this hack let me know via a Github issue. 

- googleCheckContentLoaded = true | If true it will check by interval if the content is loaded.
- googleCheckInterval = 3000 | The interval in milliseconds that is checked whether the iframe is loaded.

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

