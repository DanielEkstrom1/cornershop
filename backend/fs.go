package main

import (
	"io/fs"
	"path/filepath"
)

type Librarian struct {
	Directory string
}

func NewLibrarian(dir string) *Librarian {
	return &Librarian{Directory: dir}
}

func (l Librarian) ScanLibrary() error {
	if err := filepath.Walk(l.Directory, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if path == l.Directory {
			return nil
		}
		if err := ParseFile(info.Name()); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return err
	}
	return nil
}
