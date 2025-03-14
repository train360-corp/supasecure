package models

type SupabaseKeys struct {
	Anon string `json:"anon"`
}

type SupabaseDetails struct {
	Url  string       `json:"url"`
	Keys SupabaseKeys `json:"keys"`
}

type Credentials struct {
	Email    string          `json:"email"`
	Password string          `json:"password"`
	Type     UserTypes       `json:"type"`
	Supabase SupabaseDetails `json:"supabase"`
}
