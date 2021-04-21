#!/bin/bash

API="http://localhost:4741"
URL_PATH="/pets"

curl "${API}${URL_PATH}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
      "pet": {
        "oldName": "'"${OLDNAME}"'",
        "name": "'"${NAME}"'",
        "type": "'"${TYPE}"'",
        "age": "'"${AGE}"'"
      }
    }'

echo
