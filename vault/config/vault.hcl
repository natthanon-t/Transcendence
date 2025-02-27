listener "tcp" {
  address          = "0.0.0.0:8201"
  tls_cert_file    = "/vault/config/certs/server.crt"
  tls_key_file     = "/vault/config/certs/server.key"
}

storage "file" {
  path = "/vault/data"
}

api_addr = "https://0.0.0.0:8200"
