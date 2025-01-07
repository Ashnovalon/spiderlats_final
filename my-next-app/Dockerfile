FROM node:20-bullseye

WORKDIR /app


COPY package*.json ./
RUN npm install -g npm@11.0.0 
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate


COPY . .


EXPOSE 3000


CMD ["npm", "run", "dev"]
