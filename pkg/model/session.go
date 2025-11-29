package model

import (
	"encoding/json"
	"time"
)

type PageKind string

const (
	PageKindCode       PageKind = "code"
	PageKindChatThread PageKind = "chat_thread"
)

type Page struct {
	ID      string          `json:"id"`
	Title   string          `json:"title"`
	Kind    PageKind        `json:"kind"`
	Content json.RawMessage `json:"content"`
}

type Session struct {
	Name         string    `json:"name"`
	LastModified time.Time `json:"lastModified"`
	Pages        []Page    `json:"pages,omitempty"`
}
