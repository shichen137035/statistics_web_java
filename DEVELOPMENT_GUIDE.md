# Development Guide

This project is now considered as a pure front-end website. All the backend and database functions are used to generate static front-end file before the website starts.

## Structure  of files

Lists almost all file categories that you need to know for writing projects in the project and their storage locations in the following:

**Main structure**

statistics_web_java\

├── src\  # project files

│├── main\  # java web files

││├── java\ # back-end

│││└── com\itheima\reggie\controller" # auxiliary back-end files

││├── resources\ # front-end

│││├── common\ # Scripts, styles, dictionary, assets used globally (mainly js, css, json)

││││├── common\js # Globally used javascript (js)

││││├── common\css # Globally used css (css)

││││├── common\json # Globally used json (json)

││││└── common\asset # Globally used other asset

││││├── common\js # Globally used javascript (js)

│││├── component\ # Components used globally (mainly html, json)

│││├── i18n\ # translation files, json text files (json)

│││├── main\ # Web structure of course and concept (mainly html, css, js)

││││├── main\course # course file

││││└── main\concept # concept file

│││├──  subpages\ # Web structure of floating subpages (mainly html, css, js)

│││└── index.html # The entrance of whole website

│└── py\ # auxiliary python files (mainly python)

**Course folder structure**

For sections inside course, it is ordered like the following form:

course\

├── Introduction\ # Folder for introduction section

│├── page\ # include all the html, this is necessary, Only capitalize the first letter of a sentence

│├── js\ # JavaScript used in this section, normally not necessary

│├── style\ # CSS used in this section, normally not necessary

│├── img\ # image used in this section, normally not necessary

│├── json\ # Json used in this section, normally not necessary

│└── asset\ # Other assets used in this section, normally not necessary

├── 1. Random Sample\ # Must start with number, Capitalize the first letter of each word

│├── ...

├── ...

**Concept structure**

For sections in sider concept, it is ordered like the following form:

concept\

├── Introduction\ # Folder for introduction section

│├── page\ # include all the html, this is necessary

││└── Concept introduction.html # Main page of concept

│├── js\ # JavaScript used in this section, normally not necessary

│├── style\ # CSS used in this section, normally not necessary

│├── img\ # image used in this section, normally not necessary

│├── json\ # Json used in this section, normally not necessary

│└── asset\ # Other assets used in this section, normally not necessary

├── Distribution\ # Must start with number

│├── ...

│├── page\ # include all the html, this is necessary

││├── ...

││└── section_index.html # Main page of this section

├── ...

**For subpages, if subpage of such concept exists, then it locates in the same relative location as it in concept folder.**

**i18n folder structure**

i18n\

├── en\

│└── ...... # Repeat of structure of other files in main

├── ja\

│└── ...... # Repeat of structure of other files in main

├── .....

## Main functional mechanism

### Backend static file construction function

1. 