# Use the official Gradle image with JDK 17 to create a build artifact.
FROM gradle:jdk17 as builder

# Copy local code to the container image.
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src

# Build a release artifact.
RUN gradle build --no-daemon

# Use OpenJDK for the runtime.
FROM openjdk:22-jdk-slim

# Copy the jar to the production image from the builder stage.
COPY --from=builder /home/gradle/src/build/libs/*.jar /app.jar

# Run the web service on container startup.
CMD ["java", "-jar", "/app.jar"]
