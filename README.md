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

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
