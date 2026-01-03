import { Resource } from "sst";
import { Example } from "@ai-chat-app/core/example";

console.log(`${Example.hello()} Linked to ${Resource.MyBucket.name}.`);
