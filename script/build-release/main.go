package main

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/xhd2015/xgo/support/cmd"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}
}

func run() error {
	// 1. Run script/build to ensure frontend build successful
	// We assume this is run from project root
	fmt.Println("Building frontend...")
	err := cmd.Debug().Run("go", "run", "./script/build")
	if err != nil {
		return fmt.Errorf("frontend build failed: %v", err)
	}

	// 2. Determine release directory
	dateStr := time.Now().Format("20060102")
	releaseDir := filepath.Join("releases", dateStr)

	// 3. If dir exists, remove it
	if _, err := os.Stat(releaseDir); err == nil {
		fmt.Printf("Removing existing release directory: %s\n", releaseDir)
		if err := os.RemoveAll(releaseDir); err != nil {
			return fmt.Errorf("failed to remove %s: %v", releaseDir, err)
		}
	}

	// Create the directory
	if err := os.MkdirAll(releaseDir, 0755); err != nil {
		return fmt.Errorf("failed to create %s: %v", releaseDir, err)
	}

	// 4. Build for each target
	targets := []struct {
		OS   string
		Arch string
	}{
		{"darwin", "amd64"},
		{"darwin", "arm64"},
		{"linux", "amd64"},
		{"linux", "arm64"},
		{"windows", "amd64"},
	}

	for _, t := range targets {
		outputName := fmt.Sprintf("presentationer-%s-%s", t.OS, t.Arch)
		if t.OS == "windows" {
			outputName += ".exe"
		}
		outputPath := filepath.Join(releaseDir, outputName)

		fmt.Printf("Building for %s/%s -> %s\n", t.OS, t.Arch, outputPath)

		err := cmd.Debug().
			Env([]string{
				fmt.Sprintf("GOOS=%s", t.OS),
				fmt.Sprintf("GOARCH=%s", t.Arch),
			}).
			Run("go", "build", "-o", outputPath, ".")
		if err != nil {
			return fmt.Errorf("failed to build for %s/%s: %v", t.OS, t.Arch, err)
		}
	}

	fmt.Printf("Build complete. Assets in %s\n", releaseDir)
	return nil
}
