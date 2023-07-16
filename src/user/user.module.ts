import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { ConstantModule } from 'src/constant/constant.module';
import { AuthModule } from 'src/auth/auth.model';
import { ProfileModule } from 'src/profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    ConstantModule,
    AuthModule,
    ProfileModule
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}