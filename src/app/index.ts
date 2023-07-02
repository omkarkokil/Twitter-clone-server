import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import express from "express";
import { User } from "./user";
import cors from "cors";
import { GraphqlContext } from "../interface";
import JwtService from "../services/jwt";

export async function initServer() {
  const app = express();

  app.use(bodyParser.json());

  const graphqlServer = new ApolloServer<GraphqlContext>({
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
  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? JwtService.decodeToken(
                req.headers.authorization.split("Bearer ")[1]
              )
            : undefined,
        };
      },
    })
  );

  return app;
}
