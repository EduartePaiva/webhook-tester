import { Request, Response } from "express";
import { CreateUsetDto } from "../dtos/CreateUser.dto";

export function getUsers(request: Request, response: Response) {
    response.send([]);
}
export function getUserByID(request: Request, response: Response) {
    response.send({});
}
export function createUser(request: Request<{}, {}, CreateUsetDto>, response: Response) {
    //hi
}
