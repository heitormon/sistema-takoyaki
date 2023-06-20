FROM node:15
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build
CMD [ "npm", "run", "start:prod" ]
EXPOSE 3000