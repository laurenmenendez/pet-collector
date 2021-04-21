#!/bin/sh

API="http://localhost:4741"
URL_PATH="/pets/show"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
      "pet": {
        "name": "'"${NAME}"'"
      }
    }'

echo
