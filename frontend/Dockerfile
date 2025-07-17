FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm install          # 依存だけ先にインストールするとキャッシュが効く

COPY . .
CMD ["npm", "run", "dev", "--", "--host"]
