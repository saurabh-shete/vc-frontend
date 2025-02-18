# Use Node.js 18.20 as the base image
FROM node:18.20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# Default command to start the Vite development server
CMD ["npm", "run", "dev"]