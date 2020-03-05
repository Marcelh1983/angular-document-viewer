# 1.0.4 (05/03/2020)
* added option to pass queryParams, e.g. to set language. for google: hl=[lang] e.g. hl=nl

# 1.0.1 (02/12/2019)
* updated packages

# 1.0.0 (01/10/2019)
* added support for objectUrls docx and pdf files (docx using mammoth see readme, pdf using embedded viewer)
* added option to add an overlay to disable/hide office popout button and menu.
 
# 0.1.27 (01/08/2019)
* added option to add an overlay to disable/hide googles popout button, and/or selecting text.

# 0.1.26 (01/08/2019)
* fix for error when url is changed from != null to null

# 0.1.25 (10/25/2019)
* added googleCheckContentLoaded to be able to skip the check if the iframe content is loaded

# 0.1.21 (10/22/2019)
* support for angular9

# 0.1.20 (6/12/2019)
* use angular8
* act on viewer change

# 0.1.19 (5/27/2019)
* if iframe is null initially try to get it while polling if loaded.
* try for 20 seconds to load document

# 0.1.17 (5/24/2019)
* fixed interval reload check

# 0.1.16 (5/24/2019)
* fixed wrong import of Event type

# 0.1.15 (5/20/2019)
* Added loaded event to notify when google iframe is loaded (google only)
* Interval time back to 3000ms

# 0.1.14 (5/20/2019)
* Google Hack from AfterviewInit to ngOnChanges

# 0.1.13 (5/20/2019)
* support changing url with ngOnChanges