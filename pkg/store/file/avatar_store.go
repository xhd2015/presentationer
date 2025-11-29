package file

import (
	"context"
	"os"
	"path/filepath"
)

// Avatar Operations

func (s *FileSessionStore) ListAvatars(ctx context.Context, sessionName string) ([]string, error) {
	avatarsDir := s.getAvatarsDir(sessionName)
	entries, err := os.ReadDir(avatarsDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []string{}, nil
		}
		return nil, err
	}

	avatars := []string{}
	for _, entry := range entries {
		if !entry.IsDir() {
			avatars = append(avatars, entry.Name())
		}
	}
	return avatars, nil
}

func (s *FileSessionStore) SaveAvatar(ctx context.Context, sessionName string, avatarName string, data []byte) error {
	avatarsDir := s.getAvatarsDir(sessionName)
	if err := os.MkdirAll(avatarsDir, 0755); err != nil {
		return err
	}

	filePath := filepath.Join(avatarsDir, avatarName)
	return os.WriteFile(filePath, data, 0644)
}

func (s *FileSessionStore) DeleteAvatar(ctx context.Context, sessionName string, avatarName string) error {
	filePath := s.getAvatarPath(sessionName, avatarName)
	return os.Remove(filePath)
}

func (s *FileSessionStore) RenameAvatar(ctx context.Context, sessionName string, oldName string, newName string) error {
	oldPath := s.getAvatarPath(sessionName, oldName)
	newPath := s.getAvatarPath(sessionName, newName)
	return os.Rename(oldPath, newPath)
}

func (s *FileSessionStore) GetAvatar(ctx context.Context, sessionName string, avatarName string) ([]byte, error) {
	filePath := s.getAvatarPath(sessionName, avatarName)
	return os.ReadFile(filePath)
}
