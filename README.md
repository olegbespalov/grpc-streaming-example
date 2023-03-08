# GRPC Bidirectional Streaming Example (chat)

This is a simple example of a bidirectional streaming RPC. It is a chat server that lets clients send messages to each other.

```proto
service ChatService {
   rpc chat(stream Message) returns (stream Message) {}
}

message Message {
   string from = 1;
   string message = 2;
}
```

## Running the example

To start a new chat server, run:

```bash
node server.js
```

To connect a new client, run:

```bash
node client.js john_doe
```

To send a message from a client, type it into the terminal and press enter.

To disconnect a client, type `exit` and press enter.

You can run multiple clients at the same time. All clients will receive all messages sent by any client.

## Configuration

You can change the port that the server listens and client tries to connect on by setting the `CHAT_ADDR` environment variable.

For example, to run the server on port 50051, run:

```bash
CHAT_ADDR=localhost:50051 node server.js
```
