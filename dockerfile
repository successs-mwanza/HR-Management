FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src src

RUN chmod +x mvnw && ./mvnw package -DskipTests

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "target/demo-0.0.1-SNAPSHOT.jar"]