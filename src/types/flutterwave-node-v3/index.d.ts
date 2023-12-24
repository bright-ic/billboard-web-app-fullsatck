import express from "express";
import { ObjectType } from "../index";

export type verifyOptions = {
    id: string
}

export type verify = (data: verifyOptions) => Promise<{
    data: {
        status: string,
        amount: number,
        currency: string,
        [key:string]: any
    }
}>
export const Flutterwave: new (public_key: string, secret_key: string) => Flutterwave;

export interface Flutterwave {
    Transaction: {
        verify: verify
    }
}

// declare function Flutterwave(): express.RequestHandler;

export = Flutterwave;