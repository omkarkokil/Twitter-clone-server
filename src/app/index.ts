import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import express from "express";
import { User } from "./user";
import cors from "cors";

export async function initServer() {
  const app = express();

  app.use(bodyParser.json());

  const graphqlServer = new ApolloServer({
    typeDefs: `#graphql
      ${User.types}
        type Query {     
            ${User.queries}
            # sayHello : String
            # TellMyName(name: String , surname: String) : String
        }
      `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,

        // sayHello: () => {
        //   return "hii";
        // },

        // TellMyName: (parent: any, { name, surname }: { name: String, surname: String }) => {
        //   return `${name} ${surname}`
        // }
      },
    },
  });

  await graphqlServer.start();

  app.use(cors());
  app.use("/graphql", expressMiddleware(graphqlServer));

  return app;
}
