package file

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"

	"github.com/xhd2015/presentationer/pkg/model"
)

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

func (s *FileSessionStore) ensureDirs() error {
	if err := os.MkdirAll(s.RootDir, 0755); err != nil {
		return err
	}
	return nil
}

func (s *FileSessionStore) getSessionDir(name string) string {
	return filepath.Join(s.RootDir, name)
}

func (s *FileSessionStore) getPagesPath(name string) string {
	return filepath.Join(s.getSessionDir(name), "pages.json")
}

func (s *FileSessionStore) getAvatarsDir(name string) string {
	return filepath.Join(s.getSessionDir(name), "avatars")
}

func (s *FileSessionStore) getAvatarPath(sessionName, avatarName string) string {
	return filepath.Join(s.getAvatarsDir(sessionName), avatarName)
}

func (s *FileSessionStore) List(ctx context.Context) ([]model.Session, error) {
	if err := s.ensureDirs(); err != nil {
		return nil, err
	}

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
		pagesPath := s.getPagesPath(name)
		info, err := os.Stat(pagesPath)
		if err != nil {
			// No pages.json? maybe just an empty session dir or partial
			// If directory exists, we consider it a session, but maybe check if it has content
			// Let's use directory mod time if pages.json missing, or skip?
			// Let's skip if pages.json is missing to be safe, or treat as valid empty session?
			// Current logic implies session has content.
			// Let's assume valid session has pages.json
			continue
		}

		sessions = append(sessions, model.Session{
			Name:         name,
			LastModified: info.ModTime(),
		})
	}

	sort.Slice(sessions, func(i, j int) bool {
		return sessions[i].LastModified.After(sessions[j].LastModified)
	})

	return sessions, nil
}

func (s *FileSessionStore) Get(ctx context.Context, name string) (*model.Session, error) {
	if err := s.ensureDirs(); err != nil {
		return nil, err
	}

	pagesPath := s.getPagesPath(name)
	content, err := os.ReadFile(pagesPath)
	if err != nil {
		return nil, err
	}

	info, _ := os.Stat(pagesPath)

	var sc SessionContent
	if err := json.Unmarshal(content, &sc); err != nil || len(sc.Pages) == 0 {
		var js map[string]interface{}
		if json.Unmarshal(content, &js) == nil {
			if _, ok := js["pages"]; !ok {
				sc.Pages = []model.Page{{
					ID:      "legacy",
					Title:   "Code",
					Kind:    model.PageKindCode,
					Content: content,
				}}
			}
		} else {
			sc.Pages = []model.Page{}
		}
	}

	return &model.Session{
		Name:         name,
		Pages:        sc.Pages,
		LastModified: info.ModTime(),
	}, nil
}

func (s *FileSessionStore) Create(ctx context.Context, session *model.Session) error {
	if err := s.ensureDirs(); err != nil {
		return err
	}

	sessionDir := s.getSessionDir(session.Name)
	if _, err := os.Stat(sessionDir); err == nil {
		return fmt.Errorf("session already exists")
	}

	if err := os.MkdirAll(sessionDir, 0755); err != nil {
		return err
	}

	// Create avatars dir
	if err := os.MkdirAll(s.getAvatarsDir(session.Name), 0755); err != nil {
		return err
	}

	return s.writeSession(session.Name, session)
}

func (s *FileSessionStore) Update(ctx context.Context, session *model.Session) error {
	if err := s.ensureDirs(); err != nil {
		return err
	}
	// Ensure directory exists (handling case where it might not for some reason)
	sessionDir := s.getSessionDir(session.Name)
	if err := os.MkdirAll(sessionDir, 0755); err != nil {
		return err
	}

	return s.writeSession(session.Name, session)
}

func (s *FileSessionStore) Delete(ctx context.Context, name string) error {
	if err := s.ensureDirs(); err != nil {
		return err
	}

	sessionDir := s.getSessionDir(name)
	return os.RemoveAll(sessionDir)
}

func (s *FileSessionStore) writeSession(name string, session *model.Session) error {
	data, err := json.Marshal(SessionContent{Pages: session.Pages})
	if err != nil {
		return err
	}
	return os.WriteFile(s.getPagesPath(name), data, 0644)
}
