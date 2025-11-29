package file

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/xhd2015/presentationer/pkg/model"
)

func (s *FileSessionStore) CreatePage(ctx context.Context, sessionName string, page *model.Page) error {
	if err := s.ensureDirs(); err != nil {
		return err
	}

	pages, err := s.readPagesFromDir(sessionName)
	if err != nil {
		return err
	}
	for _, p := range pages {
		if p.ID == page.ID {
			return fmt.Errorf("page ID already exists")
		}
		if p.Title == page.Title {
			return fmt.Errorf("page title already exists")
		}
	}

	// Append
	index := len(pages) + 1
	filename := fmt.Sprintf("%d.%s.json", index, sanitizeTitle(page.Title))
	path := filepath.Join(s.getPagesDir(sessionName), filename)

	data, err := json.MarshalIndent(page, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

func (s *FileSessionStore) UpdatePage(ctx context.Context, sessionName string, page *model.Page) error {
	pages, err := s.readPagesFromDir(sessionName)
	if err != nil {
		return err
	}

	var oldPage *model.Page
	var index int = -1

	for i, p := range pages {
		if p.ID == page.ID {
			oldPage = &pages[i]
			index = i
			break
		}
	}
	if oldPage == nil {
		return fmt.Errorf("page not found")
	}

	// Check title uniqueness if changed
	if oldPage.Title != page.Title {
		for _, p := range pages {
			if p.ID != page.ID && p.Title == page.Title {
				return fmt.Errorf("page title already exists")
			}
		}
	}

	pagesDir := s.getPagesDir(sessionName)
	oldFilename := fmt.Sprintf("%d.%s.json", index+1, sanitizeTitle(oldPage.Title))
	newFilename := fmt.Sprintf("%d.%s.json", index+1, sanitizeTitle(page.Title))

	oldPath := filepath.Join(pagesDir, oldFilename)
	newPath := filepath.Join(pagesDir, newFilename)

	data, err := json.MarshalIndent(page, "", "  ")
	if err != nil {
		return err
	}

	if oldFilename != newFilename {
		// Rename (write new, delete old)
		// Or just write new, remove old
		if err := os.WriteFile(newPath, data, 0644); err != nil {
			return err
		}
		os.Remove(oldPath)
	} else {
		// Overwrite
		if err := os.WriteFile(newPath, data, 0644); err != nil {
			return err
		}
	}
	return nil
}

func (s *FileSessionStore) DeletePage(ctx context.Context, sessionName string, pageID string) error {
	pages, err := s.readPagesFromDir(sessionName)
	if err != nil {
		return err
	}

	index := -1
	for i, p := range pages {
		if p.ID == pageID {
			index = i
			break
		}
	}
	if index == -1 {
		return fmt.Errorf("page not found")
	}

	pagesDir := s.getPagesDir(sessionName)

	// Delete target
	targetFilename := fmt.Sprintf("%d.%s.json", index+1, sanitizeTitle(pages[index].Title))
	os.Remove(filepath.Join(pagesDir, targetFilename))

	// Renumber subsequent pages
	for i := index + 1; i < len(pages); i++ {
		p := pages[i]
		oldName := fmt.Sprintf("%d.%s.json", i+1, sanitizeTitle(p.Title))
		newName := fmt.Sprintf("%d.%s.json", i, sanitizeTitle(p.Title)) // Shift down

		os.Rename(filepath.Join(pagesDir, oldName), filepath.Join(pagesDir, newName))
	}

	return nil
}
