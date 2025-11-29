package file

import (
	"context"
	"fmt"

	"github.com/xhd2015/presentationer/pkg/model"
)

func (s *FileSessionStore) CreatePage(ctx context.Context, sessionName string, page *model.Page) error {
	session, err := s.Get(ctx, sessionName)
	if err != nil {
		return err
	}
	for _, p := range session.Pages {
		if p.ID == page.ID {
			return fmt.Errorf("page already exists")
		}
	}
	session.Pages = append(session.Pages, *page)
	return s.Update(ctx, session)
}

func (s *FileSessionStore) UpdatePage(ctx context.Context, sessionName string, page *model.Page) error {
	session, err := s.Get(ctx, sessionName)
	if err != nil {
		return err
	}
	found := false
	for i, p := range session.Pages {
		if p.ID == page.ID {
			session.Pages[i] = *page
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("page not found")
	}
	return s.Update(ctx, session)
}

func (s *FileSessionStore) DeletePage(ctx context.Context, sessionName string, pageID string) error {
	session, err := s.Get(ctx, sessionName)
	if err != nil {
		return err
	}
	newPages := []model.Page{}
	found := false
	for _, p := range session.Pages {
		if p.ID == pageID {
			found = true
			continue
		}
		newPages = append(newPages, p)
	}
	if !found {
		return fmt.Errorf("page not found")
	}
	session.Pages = newPages
	return s.Update(ctx, session)
}
