import { drizzle } from "drizzle-orm/neon-http";
import { Resource } from "sst";

import * as schema from "./schemas";

export const db = () => drizzle(Resource.DATABASE_URL.value, { schema });
