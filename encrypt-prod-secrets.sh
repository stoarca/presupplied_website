openssl enc -d -in password.encrypted -aes-256-cbc -pbkdf2 | openssl enc -pass stdin -in secrets.prod.json -aes-256-cbc -pbkdf2 -out secrets.prod.json.encrypted
