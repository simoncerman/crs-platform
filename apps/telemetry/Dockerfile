FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY apps/telemetry/go.mod apps/telemetry/go.sum ./
RUN go mod download

COPY apps/telemetry/ .
RUN CGO_ENABLED=0 go build -o /telemetry-server ./cmd/server
RUN CGO_ENABLED=0 go build -o /telemetry-simulator ./cmd/simulator

FROM alpine:3.20
RUN apk --no-cache add ca-certificates
WORKDIR /app

COPY --from=builder /telemetry-server .
COPY --from=builder /telemetry-simulator .

EXPOSE 8082

CMD ["./telemetry-server"]
