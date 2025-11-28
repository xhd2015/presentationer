package run

import (
	"fmt"
	"strings"

	"github.com/xhd2015/kool/pkgs/web"
	"github.com/xhd2015/presentationer/server"
)

const help = `
Usage: presentationer <subcommand>

Subcommands:
  create    Create a new presentation
`

func Run(args []string) error {
	if len(args) > 0 {
		cmd := args[0]
		args = args[1:]
		if cmd == "--help" || cmd == "help" {
			fmt.Print(strings.TrimPrefix(help, "\n"))
			return nil
		}
	}

	// next port

	port, err := web.FindAvailablePort(8080, 100)
	if err != nil {
		return err
	}
	return server.Serve(port)
}
