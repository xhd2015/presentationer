package file

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/xhd2015/presentationer/pkg/model"
)

const ConfigDirName = ".presentationer"

type SessionContent struct {
	Pages []model.Page `json:"pages"`
}

// FileSessionStore implements store.SessionStore using the file system
type FileSessionStore struct {
	RootDir string
}

func New(rootDir string) *FileSessionStore {
	return &FileSessionStore{RootDir: rootDir}
}

func (s *FileSessionStore) getSessionDir(name string) string {
	return filepath.Join(s.RootDir, name)
}

func (s *FileSessionStore) getPagesDir(name string) string {
	return filepath.Join(s.getSessionDir(name), "pages")
}

func (s *FileSessionStore) getAvatarsDir(name string) string {
	return filepath.Join(s.getSessionDir(name), "avatars")
}

func (s *FileSessionStore) getAvatarPath(sessionName, avatarName string) string {
	return filepath.Join(s.getAvatarsDir(sessionName), avatarName)
}

func (s *FileSessionStore) List(ctx context.Context) ([]model.Session, error) {
	entries, err := os.ReadDir(s.RootDir)
	if err != nil {
		return nil, err
	}

	var sessions []model.Session
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		name := entry.Name()

		// Check if .presentationer exists
		configPath := filepath.Join(s.RootDir, name, ConfigDirName)
		if _, err := os.Stat(configPath); err != nil {
			continue
		}

		pagesDir := s.getPagesDir(name)

		var modTime time.Time

		if info, err := os.Stat(pagesDir); err == nil && info.IsDir() {
			modTime = info.ModTime()
		} else {
			// Fallback to session dir
			info, _ := os.Stat(s.getSessionDir(name))
			modTime = info.ModTime()
		}

		sessions = append(sessions, model.Session{
			Name:         name,
			LastModified: modTime,
		})
	}

	sort.Slice(sessions, func(i, j int) bool {
		return sessions[i].LastModified.After(sessions[j].LastModified)
	})

	return sessions, nil
}

func (s *FileSessionStore) Get(ctx context.Context, name string) (*model.Session, error) {
	pages, err := s.readPagesFromDir(name)
	if err != nil {
		return nil, err
	}

	pagesDir := s.getPagesDir(name)
	info, err := os.Stat(pagesDir)
	if err != nil {
		info, _ = os.Stat(s.getSessionDir(name))
	}

	return &model.Session{
		Name:         name,
		Pages:        pages,
		LastModified: info.ModTime(),
	}, nil
}

func (s *FileSessionStore) Create(ctx context.Context, session *model.Session) error {
	sessionDir := s.getSessionDir(session.Name)
	if _, err := os.Stat(sessionDir); err == nil {
		return fmt.Errorf("session already exists")
	}

	if err := os.MkdirAll(sessionDir, 0755); err != nil {
		return err
	}

	// Create marker file
	markerPath := filepath.Join(sessionDir, ConfigDirName)
	if err := os.WriteFile(markerPath, []byte{}, 0644); err != nil {
		return err
	}

	if err := os.MkdirAll(s.getAvatarsDir(session.Name), 0755); err != nil {
		return err
	}

	if err := os.MkdirAll(s.getPagesDir(session.Name), 0755); err != nil {
		return err
	}

	return s.writePagesToDir(session.Name, session.Pages)
}

func (s *FileSessionStore) Update(ctx context.Context, session *model.Session) error {
	sessionDir := s.getSessionDir(session.Name)
	if err := os.MkdirAll(sessionDir, 0755); err != nil {
		return err
	}
	if err := os.MkdirAll(s.getPagesDir(session.Name), 0755); err != nil {
		return err
	}

	return s.writePagesToDir(session.Name, session.Pages)
}

func (s *FileSessionStore) Rename(ctx context.Context, oldName, newName string) error {
	oldPath := s.getSessionDir(oldName)
	newPath := s.getSessionDir(newName)

	if _, err := os.Stat(newPath); err == nil {
		return fmt.Errorf("session %s already exists", newName)
	}

	return os.Rename(oldPath, newPath)
}

func (s *FileSessionStore) Delete(ctx context.Context, name string) error {
	sessionDir := s.getSessionDir(name)
	return os.RemoveAll(sessionDir)
}

// --- Helper Logic ---

func (s *FileSessionStore) readPagesFromDir(name string) ([]model.Page, error) {
	pagesDir := s.getPagesDir(name)
	if _, err := os.Stat(pagesDir); os.IsNotExist(err) {
		return []model.Page{}, nil
	}

	entries, err := os.ReadDir(pagesDir)
	if err != nil {
		return nil, err
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".json") {
			files = append(files, e.Name())
		}
	}

	sort.Slice(files, func(i, j int) bool {
		idxI := getIndexFromFileName(files[i])
		idxJ := getIndexFromFileName(files[j])
		return idxI < idxJ
	})

	var pages []model.Page
	for _, f := range files {
		data, err := os.ReadFile(filepath.Join(pagesDir, f))
		if err != nil {
			continue
		}
		var p model.Page
		if err := json.Unmarshal(data, &p); err == nil {
			pages = append(pages, p)
		}
	}
	return pages, nil
}

func (s *FileSessionStore) writePagesToDir(sessionName string, pages []model.Page) error {
	pagesDir := s.getPagesDir(sessionName)

	os.RemoveAll(pagesDir)
	os.MkdirAll(pagesDir, 0755)

	for i, p := range pages {
		filename := fmt.Sprintf("%d.%s.json", i+1, sanitizeTitle(p.Title))
		path := filepath.Join(pagesDir, filename)

		data, err := json.MarshalIndent(p, "", "  ")
		if err != nil {
			return err
		}
		if err := os.WriteFile(path, data, 0644); err != nil {
			return err
		}
	}
	return nil
}

func getIndexFromFileName(name string) int {
	parts := strings.SplitN(name, ".", 2)
	if len(parts) > 0 {
		if idx, err := strconv.Atoi(parts[0]); err == nil {
			return idx
		}
	}
	return 9999
}

func sanitizeTitle(title string) string {
	reg := regexp.MustCompile(`[^a-zA-Z0-9\-_ ]+`)
	s := reg.ReplaceAllString(title, "_")
	s = strings.TrimSpace(s)
	if s == "" {
		return "Untitled"
	}
	return s
}
