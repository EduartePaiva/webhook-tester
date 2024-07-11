import { accessTokenType } from "./express/handlers/users";
import { envSchemaType } from "./validateEnvVariables";

export interface ServerToClientEvents {
    message: (data: { extra_url: string; payload: string }) => void;
}

export interface ClientToServerEvents {}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData extends accessTokenType {}

declare global {
    namespace NodeJS {
        export interface ProcessEnv extends envSchemaType {}
    }
}
