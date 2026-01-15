import { init } from "@instantdb/react";
import schema from "../instant.schema";

export const db = init({
  appId: "6a91b328-6a5b-4fc0-b1e8-827367bee9d0",
  schema,
});
