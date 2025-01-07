# WebSocket-Enabled Next.js Chat Application

## Overview
This project is a WebSocket-enabled chat application built with **Next.js** for the frontend and **Node.js** for the WebSocket server. It uses **Redis** for message brokering and caching, enabling real-time communication. I tried to containerize but redis container kept on closing after 10 sec. 

## Features
- **Real-Time Chat**: Supports group chat using WebSockets.
- **Scalable Architecture**: Utilizes NGINX for load balancing across multiple servers.(not finished)
- **Redis Integration**: Ensures fast and reliable message delivery.
- **Dockerized Setup**: Simplifies deployment and scaling.(not finished)
- **Authentication**: Managed with Supabase and Prisma.
- **Environment Variables Support**: Secure configuration management.

---

## Architecture
1. **Frontend**: Next.js serves the frontend UI.
2. **Backend**: A Node.js WebSocket server handles real-time communication.
3. **Redis**: Manages Pub/Sub messaging between WebSocket instances.
4. **NGINX**: Proxies HTTP requests and WebSocket connections, enabling load balancing.(not finished)
5. **Docker**: Encapsulates the application into containers for portability.(not finished)

---

## Prerequisites
- **Docker & Docker Compose** installed.(not finished, so not a prerequisite)
- **Node.js v20+** and **npm v11+**.
- **Redis** installed locally or as a container.

---

## Setup Instructions

### 1. Clone Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Follow instructions in the app readme file

### 3. Access the Application
- **Frontend**: http://localhost
- **WebSocket**: Integrated .

---

## Usage
1. Open the application in the browser.
2. Join a chat room.
3. Send messages in real time and observe updates across connected clients.

---

## Troubleshooting

1. **Redis Connection Error**
   - Ensure Redis is running and accessible.
   - Check environment variables in `.env`.

2. **WebSocket Not Connecting**
   - Check CORS settings in the WebSocket server.

---

## Contributors
- Aswin Ram



