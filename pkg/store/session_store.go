package store

import (
	"context"

	"github.com/xhd2015/presentationer/pkg/model"
)

type SessionStore interface {
	List(ctx context.Context) ([]model.Session, error)
	Get(ctx context.Context, name string) (*model.Session, error)
	Create(ctx context.Context, session *model.Session) error
	Update(ctx context.Context, session *model.Session) error
	Delete(ctx context.Context, name string) error

	// Page operations
	CreatePage(ctx context.Context, sessionName string, page *model.Page) error
	UpdatePage(ctx context.Context, sessionName string, page *model.Page) error
	DeletePage(ctx context.Context, sessionName string, pageID string) error

	// Avatar operations
	ListAvatars(ctx context.Context, sessionName string) ([]string, error)
	SaveAvatar(ctx context.Context, sessionName string, avatarName string, data []byte) error
	DeleteAvatar(ctx context.Context, sessionName string, avatarName string) error
	RenameAvatar(ctx context.Context, sessionName string, oldName string, newName string) error
	GetAvatar(ctx context.Context, sessionName string, avatarName string) ([]byte, error)
}
