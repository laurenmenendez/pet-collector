#!/bin/bash

API="http://localhost:4741"
URL_PATH="/pets"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
    "pet": {
      "name": "'"${NAME}"'",
      "type": "'"${TYPE}"'",
      "age": "'"${AGE}"'"
    }
  }'

echo
