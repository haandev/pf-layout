# Electron Robot

An Electron application with React and TypeScript.

## Table of Contents

- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Recommended IDE Setup](#recommended-ide-setup)
- [Dependencies](#dependencies)
- [Development](#development)
- [Building](#building)
- [Contributing](#contributing)

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

Ensure you have Node.js and npm installed. You can download them from [Node.js official website](https://nodejs.org/).

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/haandev/pf-layout
   ```
2. Install NPM packages:
   ```sh
   npm install
   ```

## Scripts

### Formatting and Linting

- **Format**: Formats the code using Prettier.
  ```sh
  npm run format
  ```
- **Lint**: Lints the code with ESLint and automatically fixes issues.
  ```sh
  npm run lint
  ```

### Type Checking

- **Type Check Node**: Runs TypeScript type checking for the Node.js environment.
  ```sh
  npm run typecheck:node
  ```
- **Type Check Web**: Runs TypeScript type checking for the web environment.
  ```sh
  npm run typecheck:web
  ```
- **Type Check**: Runs type checking for both Node.js and web environments.
  ```sh
  npm run typecheck
  ```

### Development

- **Electron Dev**: Starts the Electron app in development mode with source maps and inspection enabled.
  ```sh
  npm run e:dev
  ```
- **Web Dev**: Starts the React frontend development server using Vite.
  ```sh
  npm run dev
  ```

### Building

- **Build**: Builds the application for production.
  ```sh
  npm run e:build
  ```
- **Build (Windows)**: Builds the application for Windows.
  ```sh
  npm run build:win
  ```
- **Build (macOS)**: Builds the application for macOS.
  ```sh
  npm run build:mac
  ```
- **Build (Linux)**: Builds the application for Linux.
  ```sh
  npm run build:linux
  ```

## Dependencies

### Main Dependencies

- **React**: ^18.2.0
- **Electron**: ^28.2.0
- **Typescript**: ^5.3.3

### Dev Dependencies

- **ESLint**: ^8.56.0
- **Prettier**: ^3.2.4
- **Vite**: ^5.0.12

## Contributing

Contributions are what make the open-source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

