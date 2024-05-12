# Base image
from node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install global dependencies
RUN npm install -g dotenv-cli

# Copy the rest of the files
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
