# Pareto UI Starter

A modern Angular application starter with authentication, user management, and Material Design theming.

## Features

- 🔐 **Complete Authentication System** - Sign in, sign up, password recovery, email verification
- 👥 **User Management** - User profiles, CRUD operations, user lists
- 🎨 **Material Design** - Custom green theme with light/dark mode support
- 📱 **Responsive Design** - Mobile-first approach with hamburger navigation
- 🛡️ **Security** - Route guards, HTTP interceptors, JWT token management
- ⚡ **Performance** - Lazy loading, Angular 19, optimized builds

## Getting Started

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.15.

### Prerequisites

- Node.js 18+ 
- npm 9+
- Angular CLI 19+

### Installation

```bash
git clone <repository-url>
cd pareto-ui-starter
npm install
```

## Environment Configuration

The application supports three environments:

| Environment | Command | Purpose |
|-------------|---------|---------|
| **Local** | `npm start` or `npm run start:local` | Local development with debugging |
| **Dev** | `npm run start:dev` | Development server testing |
| **Production** | `npm run start:prod` | Production configuration testing |

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed environment configuration and deployment instructions.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Copyright

Copyright (c) 2025 Northern Pacific Technologies, LLC. Licensed under the MIT License.

---


