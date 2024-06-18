package tree_sitter_plymouth_script_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-plymouth_script"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_plymouth_script.Language())
	if language == nil {
		t.Errorf("Error loading PlymouthScript grammar")
	}
}
