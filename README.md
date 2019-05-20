

# ngx-doc-viewer

This component uses google document viewer or the office365 viewer to show a pdf or word document.

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

- url: document url.
- viewer: google or office
- style