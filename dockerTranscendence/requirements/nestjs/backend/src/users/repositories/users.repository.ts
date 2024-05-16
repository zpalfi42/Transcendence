import { DataSource, Repository } from "typeorm";
import { User } from "../../typeorme/user.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepository extends Repository<User> {

}