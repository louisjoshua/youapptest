import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';
import { ConstantModule } from 'src/constant/constant.module';
import { AuthModule } from 'src/auth/auth.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]), 
    ConstantModule,
    AuthModule
  ],
  providers: [ProfileService],
  exports: [ProfileService]
})
export class ProfileModule {}