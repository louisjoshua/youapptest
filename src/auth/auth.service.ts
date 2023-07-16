import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';

import { UserService } from 'src/user/user.service';
import { ErrorHttpDto } from 'src/constant/dto/error-http.dto';
import { ConstantService } from 'src/constant/constant.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService
  ) {}

  async signIn(email: string, username: string): Promise<Object>{

    var payload = { username: username, email: email };

    return {
      access_token: await this.jwtService.signAsync(payload, { secret: process.env.JWT_TOKEN}),
    };
  }
}