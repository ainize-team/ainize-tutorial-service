FROM node:16

WORKDIR /apps

COPY ./src ./src
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY yarn.lock yarn.lock

RUN yarn install
RUN yarn build
CMD ["yarn", "start"]