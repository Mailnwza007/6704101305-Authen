        // src/auth/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    private normalizeEmail(email: string) {
        return email.trim().toLowerCase();
    }

    async signUp(dto: AuthDto) {
        const email = this.normalizeEmail(dto.email);
        const userExists = await this.usersService.findByEmail(email);
        if (userExists) throw new BadRequestException('Email นี้ถูกใช้งานแล้ว');

        const passwordHash = await argon2.hash(dto.password);

        const newUser = await this.usersService.create({
            email,
            passwordHash,
        });

        return this.signToken(String(newUser._id), newUser.email);
    }

    async signIn(dto: AuthDto) {
        const email = this.normalizeEmail(dto.email);

        const user = await this.usersService.findByEmailWithPassword(email);
        if (!user) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

        const passwordMatches = await argon2.verify(user.passwordHash, dto.password);
        if (!passwordMatches) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

        return this.signToken(String(user._id), user.email);
    }

    async signToken(userId: string, email: string) {
        const payload = { sub: userId, email };
        const token = await this.jwtService.signAsync(payload);

        return {
            access_token: token,
        };
    }
}
