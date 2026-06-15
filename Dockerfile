# Build stage
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app

# Install Node.js for frontend build
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Copy the entire repository into the Docker container
COPY . .

# Build the React frontend
RUN cd reactjs-starter-app && npm install && npm run build

# Copy frontend build output to Spring Boot static resources
RUN mkdir -p traxpense-backend/src/main/resources/static && \
    cp -r reactjs-starter-app/dist/* traxpense-backend/src/main/resources/static/

# Build the Spring Boot backend (now includes frontend static files)
RUN cd traxpense-backend && mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built jar file from the build stage
COPY --from=build /app/traxpense-backend/target/TraXpense-0.0.1-SNAPSHOT.jar app.jar

# Render sets PORT dynamically; default to 8080 for local use
ENV PORT=8080
EXPOSE ${PORT}

# Run the jar file, passing the PORT to Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
