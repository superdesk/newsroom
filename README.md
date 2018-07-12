# Superdesk Newshub a.k.a. Newsroom

Newshub is a secure self-service content store, fed by outputs from a Superdesk content management system.

Each user has a password-protected Newshub account, which is accessible online from anywhere. 

Users may browse lists of articles filtered by source, topic, region - or by any classification/metadata system employed. Archived content is equally available.

Users may bookmark (save) items of interest for later download, or multiple-select items in a list for download in one, zipped file.

If a user is particularly interested in an article, they may choose to “follow” that topic, and be alerted by email to any updates or developments. 

Articles may be downloaded in NITF, NewsML G2, or as plain text. 

Users may also share items with their colleagues and comment on them.

Superdesk Newshub was developed in partnership with the Australian Associated Press news agency. Its Newshub instance, which it brands “AAP Newsroom”, is fed by the agency’s Superdesk production CMS. 

Newshub is fully responsive from desktop, to tablet, to mobile.

Sourcefabric is happy to provide demonstrations of Newshub and other newsroom tools from the Superdesk stable.

## Install

```
pip install -r requirements.txt
```

And if you want to run tests also:

```
pip install -r dev-requirements.txt
```

### UI Development install

Use npm (or yarn) to install packages:

```
npm install
```

## Run application

```
honcho start -p 5050
```

Will make it available on `http://localhost:5050` by default.

### UI Dev Server

Sources are located in `assets`, in order to use them run:

```
npm run start
```

It will start webpack dev server, python app is configured to make use of it.

## Test Python app

There is syntax and code style checker:

```
flake8 newsroom 
```

And tests:

```
python newsroom_tests.py
```

## Test Javascript code

Check syntax via eslint:

```
npm run lint
```

Or test code using karma & jasmine:

```
npm run test
```

for single run, or to watch for changes:

```
npm run test start
```
