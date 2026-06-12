# Build stage
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app

# Copy the entire repository into the Docker container
COPY . .

# Run the Maven build inside the container
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
