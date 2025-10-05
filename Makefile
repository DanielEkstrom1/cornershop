front:
	bun run dev

back:
	cd backend && go run .

sqlc:
	cd backend && sqlc generate
