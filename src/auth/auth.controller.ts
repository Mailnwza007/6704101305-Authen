// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    signup(@Body() dto: AuthDto) {
        return this.authService.signUp(dto);
    }

    @Post('signin')
    signin(@Body() dto: AuthDto) {
        return this.authService.signIn(dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Req() req: any) {
        return req.user;
    }
}
