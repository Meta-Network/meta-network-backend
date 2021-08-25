<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

Meta Network Backend

## Installation

```bash
# edit the config file
$ cp config.example.yaml config.production.yaml
$ vim config.production.yaml
$ yarn install
```

## Running the app (choose one)

```bash
# Generate RSA Key for JWT signing
$ openssl genrsa -out JWT_PRIVATE_KEY.pem 1024

# Get RSA Public Key from the private key
$ openssl rsa -in JWT_PRIVATE_KEY.pem -pubout > JWT_PUBLIC_KEY.pub

# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Conventional Commits

This project is following [commitlint](https://github.com/conventional-changelog/commitlint) rules and checks the commit message with [husky](https://typicode.github.io/husky/#/?id=features). You can also follow the [Local setup](https://commitlint.js.org/#/guides-local-setup) installation guide to install this lint in your project, like following:

```bash
# Install and configure if needed
npm install --save-dev @commitlint/{cli,config-conventional}
# or
yarn add -D @commitlint/{cli,config-conventional}
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

# Install Husky v6
npm install husky --save-dev
# or
yarn add husky --dev

# Active hooks
npx husky install
# or
yarn husky install

# Add hook
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit $1'
# or
yarn husky add .husky/commit-msg 'yarn commitlint --edit $1'
```

## Coding Stye

### Lint-staged

```bash
npx mrm@2 lint-staged
```

## Microservices

[Hybrid applcation](https://docs.nestjs.com/faq/hybrid-application#hybrid-application) + [NATS](https://docs.nestjs.com/microservices/nats)

### MessagePattern

camelCase

- `findHexGridByUserId`

### EventPattern

lowwercase + dot

- `user.profile.modified`
- ``

## Docker

### Build

```bash
docker build -t metaio/meta-network:v0.0.1 .
```

### Docker-compose

`Redis` + `NATS` + `Meta-UCenter-BE` + `Meta-Network-BE`

default as production environment

config path:

- meta-ucenter: `/var/docker/meta-ucenter/config`
- meta-network: `/var/docker/meta-network/config`

Can be changed in the `docker-compose.yml` file

```yaml
network:
  build: .
  ports:
    - '3001:3000'
  # config path
  volumes:
    - /var/usr/local/meta-network/config:/app/config
  # development environment
  environment:
    - NODE_ENV=development
  depends_on:
    - redis
    - nats
  restart: on-failure
```

You should add `config.development.yaml` `config.biz.development.yaml` files in the config paths.

```bash
/var/docker
|____meta-network
| |____config
| | |____config.production.yaml
| | |____rds-ca-2019-root.pem
| | |____config.biz.production.yaml
| | |____config.biz.example.yaml
| | |____config.example.yaml
| | |____JWT_PUBLIC_KEY.pub
|____meta-ucenter
| |____config
| | |____config.production.yaml
| | |____rds-ca-2019-root.pem
| | |____config.biz.production.yaml
| | |____config.example.yaml
| | |____JWT_PUBLIC_KEY.pub
| | |____JWT_PRIVATE_KEY.pem
```

```bash
# create & start
docker-compose up -d
# stop
docker-compose stop
#start
docker-compose start
# restart
docker-compose restart
#log (execute in a new terminal)
## network
docker-compose logs --follow network
## ucenter
docker-compose logs --follow ucenter
# stop & remove
docker-compose down
```

#### docker-compose-base.yml

development dependencies:
`Redis` + `NATS`

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
