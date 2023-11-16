
export type SignInPayloadType = {
    email: string,
    user_hash: string,
    client_ip?: string,
    sub?: string,
    iat?: any,
    exp?: any,
    nbf?: any,
    jti?: any,
    aud?: string,
    iss?: string
}

export type JWTSignINOptionsType = {
    algorithm: string,
    expiresIn: string,
    audience: string,
    issuer: string,
    subject?: string
}

export type JWTVerifyOptionsType = {
    algorithm: string[],
    audience: string,
    issuer: string,
    subject?: string
}