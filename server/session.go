package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/xhd2015/presentationer/pkg/model"
	"github.com/xhd2015/presentationer/pkg/store"
	"github.com/xhd2015/presentationer/pkg/store/file"
)

const (
	configDirName   = ".presentationer"
	sessionsDirName = "sessions"
)

// Global store instance
var sessionStore store.SessionStore

func InitSessionStore() error {
	home, err := os.UserHomeDir()
	if err != nil {
		return err
	}
	rootDir := filepath.Join(home, configDirName, sessionsDirName)
	sessionStore = file.New(rootDir)
	return nil
}

func handleListSessions(w http.ResponseWriter, r *http.Request) {
	sessions, err := sessionStore.List(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sessions)
}

func handleCreateSession(w http.ResponseWriter, r *http.Request) {
	var req model.Session
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}
	req.Name = filepath.Base(req.Name)

	if err := sessionStore.Create(r.Context(), &req); err != nil {
		if err.Error() == "session already exists" {
			http.Error(w, err.Error(), http.StatusConflict)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func handleUpdateSession(w http.ResponseWriter, r *http.Request) {
	var req model.Session
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	if err := sessionStore.Update(r.Context(), &req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func handleDeleteSession(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	if name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	if err := sessionStore.Delete(r.Context(), name); err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "Session not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

func handleGetSession(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	if name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	session, err := sessionStore.Get(r.Context(), name)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "Session not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(session)
}

func handleCreatePage(w http.ResponseWriter, r *http.Request) {
	sessionName := r.URL.Query().Get("session")
	if sessionName == "" {
		http.Error(w, "session name required", http.StatusBadRequest)
		return
	}
	var page model.Page
	if err := json.NewDecoder(r.Body).Decode(&page); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if err := sessionStore.CreatePage(r.Context(), sessionName, &page); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func handleUpdatePage(w http.ResponseWriter, r *http.Request) {
	sessionName := r.URL.Query().Get("session")
	if sessionName == "" {
		http.Error(w, "session name required", http.StatusBadRequest)
		return
	}
	var page model.Page
	if err := json.NewDecoder(r.Body).Decode(&page); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if err := sessionStore.UpdatePage(r.Context(), sessionName, &page); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func handleDeletePage(w http.ResponseWriter, r *http.Request) {
	sessionName := r.URL.Query().Get("session")
	if sessionName == "" {
		http.Error(w, "session name required", http.StatusBadRequest)
		return
	}
	pageID := r.URL.Query().Get("id")
	if pageID == "" {
		http.Error(w, "page id required", http.StatusBadRequest)
		return
	}
	if err := sessionStore.DeletePage(r.Context(), sessionName, pageID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// Avatar handlers
func handleAvatarUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	sessionName := r.URL.Query().Get("session")
	avatarName := r.URL.Query().Get("name")
	if sessionName == "" || avatarName == "" {
		http.Error(w, "session and name required", http.StatusBadRequest)
		return
	}

	// Limit upload size to 10MB
	r.ParseMultipartForm(10 << 20)

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file", http.StatusInternalServerError)
		return
	}

	if err := sessionStore.SaveAvatar(r.Context(), sessionName, avatarName, data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func handleAvatarList(w http.ResponseWriter, r *http.Request) {
	sessionName := r.URL.Query().Get("session")
	if sessionName == "" {
		http.Error(w, "session required", http.StatusBadRequest)
		return
	}

	avatars, err := sessionStore.ListAvatars(r.Context(), sessionName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(avatars)
}

func handleAvatarDelete(w http.ResponseWriter, r *http.Request) {
	sessionName := r.URL.Query().Get("session")
	avatarName := r.URL.Query().Get("name")
	if sessionName == "" || avatarName == "" {
		http.Error(w, "session and name required", http.StatusBadRequest)
		return
	}

	if err := sessionStore.DeleteAvatar(r.Context(), sessionName, avatarName); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func handleAvatarRename(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	sessionName := r.URL.Query().Get("session")
	if sessionName == "" {
		http.Error(w, "session required", http.StatusBadRequest)
		return
	}

	var payload struct {
		Old string `json:"old"`
		New string `json:"new"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if payload.Old == "" || payload.New == "" {
		http.Error(w, "old and new names required", http.StatusBadRequest)
		return
	}

	if err := sessionStore.RenameAvatar(r.Context(), sessionName, payload.Old, payload.New); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func handleAvatarGet(w http.ResponseWriter, r *http.Request) {
	sessionName := r.URL.Query().Get("session")
	avatarName := r.URL.Query().Get("name")
	if sessionName == "" || avatarName == "" {
		http.Error(w, "session and name required", http.StatusBadRequest)
		return
	}

	data, err := sessionStore.GetAvatar(r.Context(), sessionName, avatarName)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "Avatar not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Detect content type
	contentType := http.DetectContentType(data)
	w.Header().Set("Content-Type", contentType)
	w.Write(data)
}

func RegisterSessionRoutes(mux *http.ServeMux) {
	if err := InitSessionStore(); err != nil {
		fmt.Printf("Failed to init session store: %v\n", err)
	}

	mux.HandleFunc("/api/sessions/list", handleListSessions)
	mux.HandleFunc("/api/sessions/create", handleCreateSession) // POST
	mux.HandleFunc("/api/sessions/update", handleUpdateSession) // POST/PUT
	mux.HandleFunc("/api/sessions/delete", handleDeleteSession) // DELETE or POST
	mux.HandleFunc("/api/sessions/get", handleGetSession)

	// Page CRUD
	mux.HandleFunc("/api/sessions/page/create", handleCreatePage)
	mux.HandleFunc("/api/sessions/page/update", handleUpdatePage)
	mux.HandleFunc("/api/sessions/page/delete", handleDeletePage)

	// Avatar CRUD
	mux.HandleFunc("/api/sessions/avatar/upload", handleAvatarUpload)
	mux.HandleFunc("/api/sessions/avatar/list", handleAvatarList)
	mux.HandleFunc("/api/sessions/avatar/delete", handleAvatarDelete)
	mux.HandleFunc("/api/sessions/avatar/rename", handleAvatarRename)
	mux.HandleFunc("/api/sessions/avatar/get", handleAvatarGet)
}
