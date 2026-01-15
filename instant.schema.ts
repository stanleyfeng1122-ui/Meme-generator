import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    memes: i.entity({
      imageData: i.string(),
      topText: i.string(),
      bottomText: i.string(),
      createdAt: i.number(),
    }),
    upvotes: i.entity({
      createdAt: i.number(),
    }),
  },
  links: {
    memeCreator: {
      forward: { on: "memes", has: "one", label: "creator" },
      reverse: { on: "$users", has: "many", label: "memes" },
    },
    upvoteMeme: {
      forward: { on: "upvotes", has: "one", label: "meme" },
      reverse: { on: "memes", has: "many", label: "upvotes" },
    },
    upvoteUser: {
      forward: { on: "upvotes", has: "one", label: "user" },
      reverse: { on: "$users", has: "many", label: "upvotes" },
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
