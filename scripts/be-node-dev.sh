#!/bin/sh

echo "Install bash and execute 'wait-for-it.sh' script"
apk add --update bash
./scripts/wait-for-it.sh $PG_HOST:$PG_PORT --timeout=30 --strict -- echo "postgres up and running"

npm run migration:run
npm run seed:run
npm run dev