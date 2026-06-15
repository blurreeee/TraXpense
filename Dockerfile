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
RUN cp -r reactjs-starter-app/dist/* traxpense-backend/src/main/resources/static/

# Build the Spring Boot backend (now includes frontend static files)
RUN cd traxpense-backend && mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built jar file from the build stage
COPY --from=build /app/traxpense-backend/target/TraXpense-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
