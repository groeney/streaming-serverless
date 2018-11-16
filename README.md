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

### Terraform / infra deployment recipe

cd infrastructure/

export TF_VAR_TWILIO_FROM=[from]
export TF_VAR_TWILIO_SID=[SID]
export TF_VAR_TWILIO_TOKEN=[TOKEN]
export TF_VAR_SENDGRID_KEY=[KEY]

terraform init -input=false
terraform refresh
terraform plan -detailed-exitcode -out=./plan
terraform validate

terraform apply
