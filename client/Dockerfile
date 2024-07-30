FROM node:lts-alpine
COPY . /client
WORKDIR /client
RUN yarn install --frozen-lockfile
ENV NODE_ENV=production
RUN yarn build
EXPOSE 80
CMD ["yarn", "start", "-p", "80"]


# development
# ENV NODE_ENV=development
# EXPOSE 80
# CMD ["yarn", "dev", "-p", "80"]