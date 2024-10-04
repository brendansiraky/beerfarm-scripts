# Use Node.js v22.9.0 as the base image
FROM node:22-alpine3.19

# Set the working directory in the container
WORKDIR /var/app

# Copy package.json and package-lock.json (if available)
COPY package*.json .

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]