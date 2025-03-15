# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application files
COPY . .

# Install TypeScript and ts-node globally
RUN npm install -g typescript ts-node

# Set the default command
CMD ["node"]
