# Superdesk Newsroom

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
python app.py
```

Will make it available on `http://localhost:5050` by default.

### UI Dev Server

Sources are located in `assets`, in order to use them run:

```
npm run server
```

It will start webpack dev server, python app is configured to make use of it.

## Test application

There is syntax and code style checker:

```
flake8 newsroom 
```

And tests:

```
python newsroom_tests.py
```

