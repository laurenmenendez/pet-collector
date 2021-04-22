#!/bin/bash

API="http://localhost:4741"
URL_PATH="/pets"

curl "${API}${URL_PATH}/${NAME}" \
  --include \
  --request DELETE \
  --header "Authorization: Bearer ${TOKEN}" \

echo
