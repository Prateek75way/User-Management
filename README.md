# Template Project

This project is a template for building applications using Node.js, Express, and TypeScript. It includes configurations for linting, formatting, and development scripts to streamline the development process.

---

## Table of Contents
- [Setup](#setup)
- [Available Scripts](#available-scripts)
- [Development Tools](#development-tools)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Contributing](#contributing)

---

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd template
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the root of the project.
   - Add the following environment variables:
     ```
     NODE_ENV=development
     JWT_SECRET=<your-jwt-secret>
     EMAIL_USER=<your-email-user>
     EMAIL_PASS=<your-email-password>
     ```

4. Start the development server:
   ```bash
   pnpm run local
   ```

---

## Available Scripts

### Development
- `pnpm run local`: Start the server in development mode with live reload using `nodemon`.
- `pnpm run start`: Start the server using `ts-node`.
- `pnpm run dev`: Build the project and start the server in development mode.

### Production
- `pnpm run prod`: Build the project and start the server in production mode.

### Build
- `pnpm run build`: Compile TypeScript files to JavaScript.

### Linting and Formatting
- `pnpm run lint`: Run ESLint to check for code issues.
- `pnpm run lint:fix`: Fix ESLint issues automatically.
- `pnpm run format`: Format code using Prettier.
- `pnpm run format:check`: Check code formatting without making changes.

### Husky and Lint-Staged
- Pre-commit hooks are enabled using `husky` and `lint-staged` to ensure clean commits.

---

## Development Tools

- **TypeScript**: Static typing for JavaScript.
- **Nodemon**: Automatically restarts the server on file changes.
- **Prettier**: Code formatting.
- **ESLint**: Code linting.
- **Husky**: Git hooks for pre-commit checks.

---

## Project Structure

```
├── src
│   ├── controllers    # API Controllers
│   ├── middlewares    # Middleware functions
│   ├── models         # Mongoose schemas and models
│   ├── routes         # Route definitions
│   ├── services       # Business logic
│   └── utils          # Utility functions
├── dist               # Compiled JavaScript files
├── .env               # Environment variables
├── .eslintrc.json     # ESLint configuration
├── .prettierrc        # Prettier configuration
├── package.json       # Project metadata and dependencies
└── tsconfig.json      # TypeScript configuration
```

---

## Dependencies

### Runtime Dependencies
- **bcrypt**: Password hashing.
- **dotenv**: Environment variable management.
- **express**: Web framework.
- **jsonwebtoken**: JWT handling.
- **mongoose**: MongoDB ORM.
- **nodemailer**: Email sending.
- **passport**: Authentication middleware.

### Development Dependencies
- **TypeScript**: Type checking and transpilation.
- **ESLint**: Code linting.
- **Prettier**: Code formatting.
- **Husky**: Git hooks.
- **Nodemon**: Live reload.

---

## Contributing

1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

