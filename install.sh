#!/usr/bin/env bash
set -eo pipefail

if [[ ${OS:-} = Windows_NT ]]; then
    echo 'error: please install presentationer using Windows Subsystem for Linux'
    exit 1
fi

error() {
    echo "$@" >&2
    exit 1
}

command -v curl >/dev/null || error 'curl is required to install presentationer'

case $(uname -ms) in
    'Darwin x86_64')
        target=darwin-amd64
    ;;
    'Darwin arm64')
        target=darwin-arm64
    ;;
    'Linux aarch64' | 'Linux arm64')
        target=linux-arm64
    ;;
    'Linux x86_64' | *)
        target=linux-amd64
    ;;
esac

repo="xhd2015/presentationer"
binary="presentationer"

if [[ "$INSTALL_TAG" != "" ]];then
    tag=$INSTALL_TAG
    uri="https://github.com/$repo/releases/download/${tag}/${binary}-${target}"
else
    latestURL="https://github.com/$repo/releases/latest"
    headers=$(curl "$latestURL" -so /dev/null -D -)
    
    # Handle both HTTP/1.1 and HTTP/2 responses
    if [[ "$headers" != *302* ]] && [[ "$headers" != *301* ]];then
        error "expect 301 or 302 from $latestURL"
    fi
    
    location=$(echo "$headers"|grep -i "location: ")
    if [[ -z $location ]];then
        error "expect location header from $latestURL"
    fi
    
    locationURL=${location/#"location: "}
    locationURL=${locationURL/#"Location: "}
    locationURL=$(echo "$locationURL" | tr -d '\r\n')
    
    # Extract tag from URL (last component)
    tag=${locationURL##*/}
    
    if [[ -z $tag ]];then
        error "failed to parse tag from location: $locationURL"
    fi
    
    uri="https://github.com/$repo/releases/download/${tag}/${binary}-${target}"
fi

if [[ -z "${GOPATH}" ]]; then
    GOPATH=$HOME/go
fi
bin_dir=$GOPATH/bin

if [[ ! -d $bin_dir ]]; then
    mkdir -p "$bin_dir" || error "failed to create install directory \"$bin_dir\""
fi

echo "Downloading $uri ..."
curl --fail --location --progress-bar --output "$bin_dir/$binary" "$uri" || error "failed to download presentationer from \"$uri\""
chmod +x "$bin_dir/$binary"

if [[ "$INSTALL_TO_BIN" == "true" ]];then
    if [[ -w /usr/local/bin ]]; then
        mv "$bin_dir/$binary" /usr/local/bin/$binary
        echo "Installed to /usr/local/bin/$binary"
        exit 0
    else
        echo "INSTALL_TO_BIN is set, but /usr/local/bin is not writable. Please run with sudo."
        exit 1
    fi
fi

# Path setup
setup_shell() {
    local rcfile=$1
    if [[ -f "$rcfile" ]];then
        local content=$(cat "$rcfile")
        if [[ "$content" != *'# setup presentationer'* ]];then
            echo "# setup presentationer" >> "$rcfile"
            echo "export PATH=\"$bin_dir:\$PATH\"" >> "$rcfile"
            echo "Added presentationer to PATH in $rcfile"
        fi
    fi
}

setup_shell ~/.bash_profile
setup_shell ~/.zshrc
setup_shell ~/.bashrc

echo "Successfully installed presentationer to $bin_dir/$binary"
echo "You may need to restart your shell or run 'source ~/.bashrc' (or .zshrc) to use 'presentationer' command."

