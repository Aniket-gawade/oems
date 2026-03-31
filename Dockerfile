FROM maven:3.9.11-eclipse-temurin-25 AS builder
WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw mvnw
COPY pom.xml pom.xml
COPY shared shared
COPY apps/oems-api apps/oems-api

RUN chmod +x mvnw && ./mvnw -B -ntp -pl apps/oems-api -am clean package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --uid 10001 --create-home oems

COPY --from=builder /workspace/apps/oems-api/target/oems-api-*.jar /app/oems-api.jar

USER oems
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 \
  CMD curl -fsS http://localhost:8080/actuator/health | grep -q "\"status\":\"UP\"" || exit 1

ENTRYPOINT ["java", "-jar", "/app/oems-api.jar"]
