A working example showcasing how event-driven microservice architecture can be used to declutter application code by decoupling tasks from your web applications.

## Installation

Run `. ./scripts/setup.sh` from the root of the project directory

- [Terraform](https://www.terraform.io/) (recommended via `brew` on macOS)
- [Docker for Mac](https://docs.docker.com/v17.12/docker-for-mac/install/) (.dmg available)

## Running the stack

- Running `grunt start` will build the necessary infrastructure with Localstack and start the client and server
- Running `grunt watch:lambda` will deploy changes to infrastructure when it detects changes to any lambda `function.zip`

## Contributing

### Git Commit Message Convention

Messages must be matched by the following regex:

```js
/^(revert: )?(feat|fix|style|refactor|chore)(\(.+\))?: .{1,50}/;
```

### Misc thoughts

- Toggle to LAMBDA_EXECUTOR=docker when dev so you can view log output from docker container. Using LAMBDA_EXECUTOR=docker-reuse for performance benefits
