# Use Java 21 (Eclipse Temurin) as base image
FROM eclipse-temurin:21-jdk

# Set working directory
WORKDIR /app

# Copy your JAR file to the container
COPY target/*.jar Wallet-0.0.1-SNAPSHOT.jar

# Expose the port (Render will set the actual port via $PORT)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]