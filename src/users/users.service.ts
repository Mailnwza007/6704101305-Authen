// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    findByEmail(email: string) {
        return this.userModel.findOne({ email }).exec();
    }

    findByEmailWithPassword(email: string) {
        return this.userModel.findOne({ email }).select('+passwordHash').exec();
    }

    create(data: { email: string; passwordHash: string }) {
        return this.userModel.create(data);
    }
}
