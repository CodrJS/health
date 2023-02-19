# @codrjs/health

![npm version](https://img.shields.io/npm/v/@codrjs/health)
[![CodeQL](https://github.com/CodrJS/health/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/CodrJS/health/actions/workflows/codeql.yml)

## Purpose

This repository has a custom-built service health tracker. ServiceHealth is a singleton located at `src/index.ts`. This utility is used to hook into kafka events to keep a close eye on what is up and down. This data can then be quickly shared via the `getStatus()` command.

If using the `@codrjs/kafka` module, then all consumers and producers are already bening listened to. There is no need to manually add them to the service health singleton.

## Getting started

Install the package from the npm registry.

```bash
yarn add @codrjs/health
```

Inside the micro-service, you can get the status of all topics and servers with a simple command.

```ts
/* Import the health and kafka packages */
import ServiceHealth from "@codrjs/health";
import { express } from "express";

const app = express();
app.route("/heath", (req, res, next) => {
  res.status(200).json(ServiceHealth.getStatus());
});
```

## Todo

- [ ] Add expressjs health data
- [ ] Add tests

## Contributing

```bash
# Clone the repo
git clone git@github.com:CodrJS/health.git

# Install yarn if you don't have it already
npm install -g yarn

# Install dependencies, build, and test the code
yarn install
yarn build
yarn test
```
