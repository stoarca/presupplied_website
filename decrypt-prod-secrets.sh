openssl enc -d -in password.encrypted -aes-256-cbc -pbkdf2 | openssl enc -d -pass stdin -in secrets.prod.json.encrypted -aes-256-cbc -pbkdf2 -out secrets.prod.json
