import { writeFile } from "fs-extra";
import { OpenAPIV3 } from "openapi-types";
import prettier from "prettier";
import comment from "../comment";
import { DIRECTORY } from "../utils";
import type { HookMetadata } from "./types";
import {
  appendQueryParametersToURL,
  callbackDependencies,
  definitionParameters,
  hookParameters,
  parseHookName,
  parseURL,
} from "./utils";

export async function generateGetHook(
  pathName: string,
  containerApiUrl: string,
  parameterObjects?: OpenAPIV3.ParameterObject[]
): Promise<HookMetadata> {
  const url = parseURL(pathName, containerApiUrl);
  const hookName = parseHookName(pathName, "get");

  const content = `
    ${comment}

    import { useCallback, useEffect, useState } from "react";

    function ${hookName}(${hookParameters(parameterObjects)}) {
      const [isError, setIsError] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const [data, setData] = useState<unknown>();

      const headers = (): HeadersInit => {
        const token = localStorage.getItem("engine-token");
        return token ? { Authorization: \`Bearer \${token}\` } : {};
      };

      const fetchData = useCallback(async () => {
        const url = new URL(\`${url}\`);

        ${appendQueryParametersToURL(parameterObjects)}

        const response = await fetch(
          url.toString(),
          {
            headers: headers(),
          }
        );
        setData(await response.json());
      }, [${callbackDependencies(parameterObjects)}]);


      useEffect(() => {
        setIsLoading(true);
        fetchData()
          .catch(() => {
            setIsError(true);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }, [fetchData]);

      return {
        data,
        isError,
        isLoading,
      }
    }

    export default ${hookName};
  `;

  const formattedContent = await prettier.format(content, {
    parser: "typescript",
  });

  // console.log(formattedContent);

  await writeFile(`${DIRECTORY}/hooks/${hookName}.ts`, formattedContent);

  return {
    hookName,
    definition: `const { data, isError, isLoading } = ${hookName}(${definitionParameters(
      parameterObjects
    )});`,
    import: `import ${hookName} from "@/__backengine__/hooks/${hookName}";`,
    parameters: parameterObjects,
  };
}
