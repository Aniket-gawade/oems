import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import openapiTS, { astToString, COMMENT_HEADER } from "openapi-typescript";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(scriptDir, "..");

export const openApiSpecPath = resolve(appRoot, "../../docs/api/openapi-phase1.yaml");
export const generatedTypesPath = resolve(appRoot, "src/api/generated/openapi.ts");

export const renderOpenApiTypes = async () => {
  const ast = await openapiTS(pathToFileURL(openApiSpecPath));
  return `${COMMENT_HEADER}${astToString(ast)}`;
};

export const writeOpenApiTypes = async () => {
  const generatedTypes = await renderOpenApiTypes();
  await mkdir(dirname(generatedTypesPath), { recursive: true });
  await writeFile(generatedTypesPath, generatedTypes, "utf8");
};

export const readGeneratedOpenApiTypes = async () => readFile(generatedTypesPath, "utf8");
