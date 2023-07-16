import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { User } from './user.entity';
import { RegisterUserDto } from './dto/register-user.dto';

import { Logger } from '@nestjs/common';
import { ConstantService } from 'src/constant/constant.service';
import { ErrorHttpDto } from 'src/constant/dto/error-http.dto';
import { Profile } from 'src/profile/profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private constantService: ConstantService
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOneByEmailWithProfile(email: string): Promise<User | null> {
    return this.usersRepository
                    .createQueryBuilder("p")
                    .leftJoinAndSelect("p.profiles", "profile")
                    .where(["p.email = :email", { email: email}])
                    .getOne()
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email: email});
  }

  async createOne(registerUserDto: RegisterUserDto): Promise<User | ErrorHttpDto> {
    //Checkers

    var profile_result = await this.findOneByEmail(registerUserDto.email);
    if(profile_result != null){
      return this.constantService.errorHttpExistingEmail
    }

    if(registerUserDto.password == null){
      return this.constantService.errorHttpMissingField
    }

    if(registerUserDto.password.length <= 7){
      return this.constantService.errorHttpMissingField
    }

    registerUserDto.password = await this.constantService.HashPassword(registerUserDto.password);

    Logger.log('User Service createOne started')
    const queryRunner = this.dataSource.createQueryRunner();

    const user = new User();
    user.email = registerUserDto.email;
    user.password = registerUserDto.password;
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(user);
  
      await queryRunner.commitTransaction();
      Logger.log('User Service reached end of try without error')
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();

      Logger.log('User Service createOne error '+err)

      return this.constantService.errorHttpGeneral;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }

    return await this.findOneByEmail(user.email);

    Logger.log('User Service createOne ended')
  }

  async AddProfile(email: string, new_profile: Profile): Promise<User | ErrorHttpDto> {
    //Checkers

    var profile_result = await this.findOneByEmail(email);
    if(profile_result != null){
      return this.constantService.errorHttpExistingEmail
    }

    profile_result.profiles = profile_result.profiles.concat(new_profile);

    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(User, {email}, {profiles: profile_result.profiles});
  
      await queryRunner.commitTransaction();
      Logger.log('User Service reached end of try without error')
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();

      Logger.log('User Service createOne error '+err)

      return this.constantService.errorHttpGeneral;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }

    return profile_result;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}