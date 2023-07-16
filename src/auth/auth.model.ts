import { Module, forwardRef } from '@nestjs/common';

import { AuthService } from './auth.service';

import { ConstantModule } from 'src/constant/constant.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        ConstantModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_TOKEN,
            signOptions: { expiresIn: '600s' },
          })
    ],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule {}