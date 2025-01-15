
export type StandardApiResponse = Promise<{success: boolean, data: any, raw?:any}>;
export type StandardApiResponseWithoutPromise = {success: boolean, data?: any, errors?: any, raw?:any};
export type StandardServiceResponse = (data: any) => {success: boolean, data: any};
export type PromiseServiceResponse = Promise<{success: boolean, data: any}>;
export type ObjectType = {
    [key: string]: any
}

export type RequestHeaderConfigType = {
    headers: {
        Authorization?:string,
        [key:string]: any
    }
}
