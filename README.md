# Node.js Ecommerce Frontend

A dependency-free Node.js ecommerce frontend. The app serves a responsive shop UI with product filtering, search, sorting, cart drawer, and checkout button.

## Run Locally

```powershell
npm start
```

Open:

```text
http://localhost:3000
```

## Run With Docker

The Dockerfile uses a multi-stage build and runs the app as the built-in non-root `node` user.

Build the image:

```powershell
docker build -t node-ecommerce-frontend .
```

Run the container:

```powershell
docker run --rm -p 3000:3000 node-ecommerce-frontend
```

Open:

```text
http://localhost:3000
```

## Project Structure

```text
.
|-- Dockerfile
|-- README.md
|-- package.json
|-- server.js
`-- public/
    |-- index.html
    |-- styles.css
    `-- app.js
```
