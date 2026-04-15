FROM eclipse-mosquitto:2.0

RUN printf '\
listener 1883\n\
protocol mqtt\n\
listener 9001\n\
protocol websockets\n\
allow_anonymous true\n\
persistence true\n\
persistence_location /mosquitto/data/\n\
log_dest stdout\n\
log_type all\n\
log_timestamp true\n\
max_connections -1\n\
max_queued_messages 1000\n\
message_size_limit 0\n' > /mosquitto/config/mosquitto.conf

EXPOSE 1883 9001
