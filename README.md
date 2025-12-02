# Presentationer

An easy-to-use slides maker, including code, chatting threads etc.

# Install

```sh
# macOS and Linux (and WSL)
curl -fsSL https://github.com/xhd2015/xgo/raw/master/script/install/install.sh | bash

# Windows: Please manually download from release page
```

# Install

```sh
git clone https://github.com/xhd2015/presentationer

cd presentationer

# build frontend
go run ./script/build

# run the app
go run ./
```

# Where are my files stored?

All files are stored under your home directory: 

```sh
ls ~/.presentationer/
```

# Development

```sh
# server & frontend hot reload
go run ./ --dev
```