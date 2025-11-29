# Presentationer

An easy-to-use slides maker, including code, chatting threads etc.

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
# frontend
(cd presentationer-react && bun run dev)

# server
go run ./ --dev
```