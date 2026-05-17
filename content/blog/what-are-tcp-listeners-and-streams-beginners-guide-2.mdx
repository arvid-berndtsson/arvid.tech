---
title: "What are TCP Listeners and Streams? (Beginner's Guide)"
date: 2024-11-03
tags: ["python", "programming", "web-development", "tutorial"]
summary: "Discover how popular chat apps like WhatsApp and Discord communicate behind the scenes using TCP. This beginner-friendly guide explains TCP Listeners and Streams using simple analogies and practical Python examples you can try yourself."
---

Ever wondered how chat apps like [WhatsApp](https://www.whatsapp.com/) or [Discord](https://discord.com/) actually work under the hood? At their core, they use TCP (Transmission Control Protocol) to send messages between computers. If you're new to networking, understanding TCP Listeners and Streams is your first step into this fascinating world.

Let's break down these concepts using simple, real-world analogies that you'll understand even if you've never done networking before. Imagine you're building your own chat app:

## TcpListener&nbsp;is like a doorbell 🔔

- Only servers have a TcpListener.
- It sits and waits for clients to connect (like a doorbell waiting to be rung)

In Python, it would be similar to this:

```
import socket

# This is like a TcpListener
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(("localhost", 6379))
server.listen(5)  # Allow up to 5 pending connections

try:
    while True:
        # Wait for someone to "ring the doorbell"
        connection, address = server.accept()
        print(f"Someone connected from {address}!")
except KeyboardInterrupt:
    server.close()
```

> Note: We're using port 6379 in these examples, but you can use any available port number between 1024 and 65535 (registered or dynamic ports). Lower ports (0-1023) are often reserved for system services and require admin privileges. Just make sure both server and client use the same port.

## TcpStream is like a phone call 📞

- Both servers and clients use TcpStreams
- **For servers**: Each accepted connection becomes a TcpStream
- **For clients**: Their socket is a TcpStream as soon as they connect
- You can send messages back and forth through it

### Server Side

The 'connection' from `accept()` is a TcpStream

```
message = connection.recv(1024)  # Receive data
print(f"They said: {message}")
connection.send("Hi back!")      # Send data
```

### Client Side

The 'client' `socket` is also a TcpStream

```
client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(("localhost", 6379))  # Connect to server
client.send("Hello!")                # Send data
response = client.recv(1024)         # Receive data
```

## Real-world examples

### When you open WhatsApp Web

- Your browser rings the WhatsApp server's doorbell (connects&nbsp;to TcpListener)
- The&nbsp;server answers and creates a phone line (TcpStream) just for you.
- You can now chat&nbsp;through this dedicated line.
- Meanwhile, the doorbell&nbsp;(TcpListener) keeps working&nbsp;for other people.

### The&nbsp;server can handle many connections at once

- Like having many phone calls happening at the same time
- Each person gets their own private&nbsp;line (TcpStream)
- The doorbell (TcpListener) keeps working for new people.

## So, in super&nbsp;simple terms

- TcpListener&nbsp;= Doorbell that tells you when someone wants&nbsp;to connect
- TcpStream = The&nbsp;actual connection where messages go back and forth

## Try It Yourself!

Create a simple echo server that:

1. Listens for connections
2. Receives a message
3. Sends the same message back
4. Closes the connection

This is a great way to practice working with TCP Listeners and Streams!

### Complete example

#### Server Code

```
import socket

def run_echo_server():
    # Create and configure the server
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(("localhost", 6379))
    server.listen(5)
    print("Echo server is listening...")

    try:
        while True:
            # Wait for connection
            connection, address = server.accept()
            print(f"Client connected from {address}")

            try:
                # Handle one client
                while True:
                    message = connection.recv(1024).decode()
                    if not message:
                        break
                    print(f"Received: {message}")
                    connection.send(message.encode())
            except Exception as e:
                print(f"Error handling client: {e}")
            finally:
                connection.close()
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        server.close()

if __name__ == "__main__":
    run_echo_server()
```

<p dir="ltr">Server has the doorbell&nbsp;(Listener) and can create phone lines (Streams)</p>

#### Client Code

```
import socket

def run_client():
    # Create a client socket
    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    try:
        # Connect to the server
        client.connect(("localhost", 6379))

        # Send a test message
        message = "Hello, Echo Server!"
        client.send(message.encode())

        # Receive the response
        response = client.recv(1024).decode()
        print(f"Server echoed: {response}")

    except ConnectionRefusedError:
        print("Could not connect to server. Is it running?")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    run_client()
```

<p dir="ltr">Client just has their phone (Stream) to&nbsp;call the server with</p>

Try running the server in one terminal and the client in another!

## Common Gotchas

- Make sure to run the server before the client.
- The `encode()` and `decode()` functions are needed because TCP streams work with bytes, not strings.
- Always close your connections to free up system resources

## Further Reading

- [Python Socket Programming Documentation](https://docs.python.org/3/library/socket.html)
- [What is TCP/IP?](https://www.techtarget.com/searchnetworking/definition/TCP-IP)
