### A working example showcasing how event-driven architecture can be used to decouple asynchronous tasks from your web applications.

## Prerequisites

Run `sh ./scripts/setup.sh` from the root of the project directory

- [Terraform](https://www.terraform.io/) (recommended via `brew` on macOS)
- [Localstack](https://localstack.cloud/) (recommended via `pip`)
- [Docker for Mac](https://docs.docker.com/v17.12/docker-for-mac/install/)

## Git Commit Message Convention

Messages must be matched by the following regex:

```js
/^(revert: )?(feat|fix|style|refactor|chore)(\(.+\))?: .{1,50}/;
```

## Running the stack

- Running `grunt start` will build the necessary infrastructure with Localstack and start the client and server
