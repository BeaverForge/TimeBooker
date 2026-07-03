FROM golang:1.26 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o build/server ./cmd/server

FROM gcr.io/distroless/static
COPY --from=builder /app/build/server /server
EXPOSE 8080
CMD ["/server"]
