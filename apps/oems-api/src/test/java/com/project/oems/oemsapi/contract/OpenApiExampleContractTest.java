package com.project.oems.oemsapi.contract;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.networknt.schema.ValidationMessage;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class OpenApiExampleContractTest {

    private static final ObjectMapper YAML_MAPPER = new ObjectMapper(new YAMLFactory()).findAndRegisterModules();
    private static final JsonSchemaFactory SCHEMA_FACTORY = JsonSchemaFactory.getInstance(SpecVersion.VersionFlag.V202012);
    private static final String SCHEMA_REF_PREFIX = "#/components/schemas/";
    private static final String DEFS_REF_PREFIX = "#/$defs/";

    private static JsonNode openApi;
    private static ObjectNode schemas;

    @BeforeAll
    static void loadOpenApiSpec() throws IOException {
        Path openApiPath = Path.of("")
                .toAbsolutePath()
                .resolve("../../docs/api/openapi-phase1.yaml")
                .normalize();

        openApi = YAML_MAPPER.readTree(Files.readString(openApiPath));
        JsonNode schemaNode = openApi.at("/components/schemas");
        assertThat(schemaNode.isObject())
                .as("Expected /components/schemas in OpenAPI spec.")
                .isTrue();

        schemas = JsonNodeFactory.instance.objectNode();
        Iterator<Map.Entry<String, JsonNode>> entries = schemaNode.fields();
        while (entries.hasNext()) {
            Map.Entry<String, JsonNode> entry = entries.next();
            JsonNode schemaCopy = entry.getValue().deepCopy();
            rewriteSchemaRefs(schemaCopy);
            schemas.set(entry.getKey(), schemaCopy);
        }
    }

    @ParameterizedTest(name = "{0} conforms to {1}")
    @MethodSource("exampleContracts")
    void openApiExamplesConformToDeclaredSchemas(String exampleName, String schemaName) {
        JsonNode exampleValue = openApi.at("/components/examples/" + exampleName + "/value");
        assertThat(exampleValue.isMissingNode())
                .as("Example '%s' was not found in OpenAPI spec.", exampleName)
                .isFalse();

        JsonSchema jsonSchema = schemaFor(schemaName);
        Set<ValidationMessage> errors = jsonSchema.validate(exampleValue);

        assertThat(errors)
                .as("Example '%s' does not conform to schema '%s': %s", exampleName, schemaName, errors)
                .isEmpty();
    }

    private static JsonSchema schemaFor(String schemaName) {
        JsonNode targetSchema = schemas.get(schemaName);
        assertThat(targetSchema)
                .as("Schema '%s' was not found in OpenAPI spec.", schemaName)
                .isNotNull();
        assertThat(targetSchema.isObject())
                .as("Schema '%s' must be an object.", schemaName)
                .isTrue();

        ObjectNode assembledSchema = JsonNodeFactory.instance.objectNode();
        assembledSchema.put("$schema", "https://json-schema.org/draft/2020-12/schema");
        assembledSchema.setAll((ObjectNode) targetSchema.deepCopy());
        assembledSchema.set("$defs", schemas.deepCopy());

        return SCHEMA_FACTORY.getSchema(assembledSchema);
    }

    private static void rewriteSchemaRefs(JsonNode node) {
        if (node instanceof ObjectNode objectNode) {
            Iterator<Map.Entry<String, JsonNode>> fields = objectNode.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                String key = field.getKey();
                JsonNode value = field.getValue();
                if ("$ref".equals(key) && value.isTextual()) {
                    String refValue = value.textValue();
                    if (refValue.startsWith(SCHEMA_REF_PREFIX)) {
                        objectNode.put("$ref", DEFS_REF_PREFIX + refValue.substring(SCHEMA_REF_PREFIX.length()));
                    }
                } else {
                    rewriteSchemaRefs(value);
                }
            }
        } else if (node instanceof ArrayNode arrayNode) {
            for (JsonNode item : arrayNode) {
                rewriteSchemaRefs(item);
            }
        }
    }

    private static Stream<Arguments> exampleContracts() {
        return Stream.of(
                Arguments.of("PlaceOrderRequestLimit", "PlaceOrderRequest"),
                Arguments.of("PlaceOrderRequestMarket", "PlaceOrderRequest"),
                Arguments.of("PlaceOrderResponseAccepted", "PlaceOrderResponse"),
                Arguments.of("OrderDetailResponseFound", "OrderDetailResponse"),
                Arguments.of("InstrumentResponseFound", "InstrumentResponse"),
                Arguments.of("ValidationErrorExample", "ApiError"),
                Arguments.of("UnauthorizedErrorExample", "ApiError"),
                Arguments.of("ForbiddenErrorExample", "ApiError"),
                Arguments.of("ResourceNotFoundErrorExample", "ApiError"),
                Arguments.of("InstrumentNotFoundErrorExample", "ApiError"),
                Arguments.of("InstrumentNotTradableErrorExample", "ApiError"),
                Arguments.of("RiskMaxQtyExceededErrorExample", "ApiError"),
                Arguments.of("RiskMaxNotionalExceededErrorExample", "ApiError"),
                Arguments.of("RiskPriceBandExceededErrorExample", "ApiError"),
                Arguments.of("IdempotencyConflictErrorExample", "ApiError"),
                Arguments.of("InternalServerErrorExample", "ApiError")
        );
    }
}
