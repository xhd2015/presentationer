package main

import (
	"embed"
	"fmt"
	"os"

	"github.com/xhd2015/presentationer/run"
	"github.com/xhd2015/presentationer/server"
)

//go:embed presentationer-react/dist
var distFS embed.FS

func main() {
	server.Init(distFS)

	err := run.Run(os.Args[1:])
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}
}
