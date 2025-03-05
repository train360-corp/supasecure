package models

import (
	"github.com/google/uuid"
	"time"
)

type Environment struct {
	ID          uuid.UUID `json:"id" db:"id"`
	WorkspaceID uuid.UUID `json:"workspace_id" db:"workspace_id"`
	Display     string    `json:"display" db:"display"`
}

type Workspace struct {
	ID        uuid.UUID `json:"id" db:"id"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	TenantID  uuid.UUID `json:"tenant_id" db:"tenant_id"`
	Display   string    `json:"display" db:"display"`
}

type GetSecretsRow struct {
	ID            uuid.UUID `json:"id"`
	CreatedAt     time.Time `json:"created_at"`
	EnvironmentID uuid.UUID `json:"environment_id"`
	VariableID    uuid.UUID `json:"variable_id"`
	WorkspaceID   uuid.UUID `json:"workspace_id"`
	UID           string    `json:"uid"`
	Variable      string    `json:"variable"`
	Secret        string    `json:"secret"`
}
