import axios from "axios";
import prettier from "prettier";
import { log } from "./log";

export type Tables = Table[];

export type Table = {
  id: number;
  schema: string;
  name: string;
  rls_enabled: boolean;
  rls_forced: boolean;
  replica_identity: string;
  bytes: number;
  size: string;
  live_rows_estimate: number;
  dead_rows_estimate: number;
  comment: string | null;
  primary_keys: PrimaryKey[];
  relationships: Relationship[];
};

export type PrimaryKey = {
  schema: string;
  table_name: string;
  name: string;
  table_id: number;
};

export type Relationship = {
  id: number;
  constraint_name: string;
  source_schema: string;
  source_table_name: string;
  source_column_name: string;
  target_table_schema: string;
  target_table_name: string;
  target_column_name: string;
};

export type File = {
  fileName: string;
  content: string;
};

export const fetchTypes = async (): Promise<File> => {
  // TODO: use proxy
  const typesResponse = await axios.get<string>(
    "http://0.0.0.0:1337/generators/typescript"
  );
  log("Fetched types metadata");

  const formattedContent = await prettier.format(typesResponse.data, {
    parser: "typescript",
  });

  return {
    content: formattedContent,
    fileName: "types.ts",
  };
};
