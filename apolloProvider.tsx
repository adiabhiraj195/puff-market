"use client";

import React, { ReactNode } from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_APOLLO_URL,
});

export const Apolloprovider = ({ children }: { children: ReactNode }) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};