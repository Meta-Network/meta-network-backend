FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn --production --silent
RUN rm package.json yarn.lock
RUN mkdir dist
COPY dist dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
