export type DynamicObject = {
    [key: string]: any
}

export enum RoleEnum {
    Admin = "admin",
    User = "user",
}

export enum TicketStatusEnum {
    Closed = "closed",
    Open = "open"
}

export enum BlogStatusEnum {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}