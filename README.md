
___
### Inspiration
Inspired by [this blog](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying) and [TodoMVC](https://github.com/tastejs/todomvc), this tool will leave the reader with an intuitive sense for [event-driven systems](https://en.wikipedia.org/wiki/Event-driven_architecture), how they work and what their benefits are.

As opposed to [Apache Kafka](https://kafka.apache.org/) where all of the streaming components are packaged up into a platform this tool aims to give you more control of your event-driven system. Using [Terraform](https://terraform.io) and your preferred cloud provider, you can add and remove  components to suit your needs. The architecture laid out here is production ready and works nicely  in most cases.

This tool uses [Change Data Capture](https://en.wikipedia.org/wiki/Change_data_capture) as the event source and [Serverless Architecture](https://en.wikipedia.org/wiki/Serverless_computing) as the fundamental design pattern for data processing.
___

## Installation

Prerequisites:
- `darwin*` OS
- [Docker for Mac](https://docs.docker.com/v17.12/docker-for-mac/install/)

Run `./scripts/setup.sh` from the root to install project dependencies

___

## Distillation

### Quick start

- Create dotenv file: `dotenv=./.env && cp "$dotenv.example" "$dotenv" && vi $dotenv` -- update keys where appropriate (Sendgrid & Twilio)
- Checkout a version + runtime branch: `git checkout v2-py`
- Start stack: `grunt start`

### Tutorial
_This tutorial takes inspiration from [TodoMVC](https://github.com/tastejs/todomvc) and extends it by using serverless microservice architecture to send notifications to users when there is a change in there task list._
- Two versions of the stack.
  - v1: send email notifications on new task
  - v2: send email and sms notifications on new, edit and delete task.
- For each version there is a _python3.6_ lambda runtime and _node8.10_ lambda runtime.
- Checkout the following branches to see the respective version and runtime:
  - `v1-js`
  - `v2-js`
  - `v1-py`
  - `v2-py`
- Note that we set `LAMBDA_EXECUTOR=docker-reuse` on [docker-compose.yaml:32](https://github.com/j-groeneveld/streaming-serverless/blob/master/docker-compose.yml#L32) for these branches. This is for performance gains as `LAMBDA_EXECUTOR=docker` starts from "cold start" for every invocation.
- Copy `.env.example` into `.env` and replace keys where appropriate
- Running `grunt start` will build three services from `docker-compose.yml`:
  - `localstack`: mock AWS Cloud services on local. See [here](https://github.com/localstack/localstack)
  - `client`: this is a basic [vuejs](https://github.com/vuejs/vue) application inspired by [TodoMVC](https://github.com/tastejs/todomvc/tree/master/examples/vue)
  - `server`: simple node + express application for Todo list

### For development
- Running `grunt watch:lambda` will deploy changes to infrastructure when it detects changes to any lambda file
- This is nice when for watching the lambda containers: `watch -n 1 'docker ps -a | grep lambda'`

### Git Message Convention

Messages must be matched by the following regex:

```js
/^(revert: )?(feat|fix|style|refactor|chore)(\(.+\))?: .{1,50}/;
```
