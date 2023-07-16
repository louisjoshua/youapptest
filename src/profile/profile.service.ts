import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Profile } from './profile.entity';

import { Logger } from '@nestjs/common';
import { ConstantService } from 'src/constant/constant.service';
import { ErrorHttpDto } from 'src/constant/dto/error-http.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private dataSource: DataSource,
    private constantService: ConstantService
  ) {}

  findById(objectId: ObjectId): Promise<Profile | null> {
    return this.profileRepository.findOneBy({ id: objectId });
  }

  async findByEmail(email: string): Promise<Profile[]> {
    const [items, nums] = await this.profileRepository.findAndCount({ 
      where: {email},
      take: 99999
    });

    return items;
  }

  findOneByUsername(username: string, username_tag: string): Promise<Profile | null> {
    return this.profileRepository.findOneBy({ username: username, username_tag: username_tag });
  }

  async createOne(createProfileDto: CreateProfileDto): Promise<Profile | ErrorHttpDto> {
    //Checkers

    var profile_result_2 = await this.findOneByUsername(createProfileDto.username, createProfileDto.username_tag);
    if(profile_result_2 != null){
      return this.constantService.errorHttpExistingUsername
    }
    
    const queryRunner = this.dataSource.createQueryRunner();

    const profile = new Profile();
    profile.email = createProfileDto.email;
    profile.username = createProfileDto.username;
    profile.username_tag = createProfileDto.username_tag;
    profile.about = createProfileDto.about;
    profile.interest = createProfileDto.interest;
    profile.display_name = createProfileDto.display_name;    
    profile.gender = createProfileDto.gender;    
    profile.birthday = createProfileDto.birthday;    
    profile.height_unit = createProfileDto.height_unit;    
    profile.height_value = createProfileDto.height_value;    
    profile.weight_unit = createProfileDto.weight_unit;
    profile.weight_value = createProfileDto.weight_value;
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(profile);
  
      await queryRunner.commitTransaction();
      Logger.log('Profile Service reached end of try without error')
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();

      Logger.log('Profile Service createOne error '+err)

      return this.constantService.errorHttpGeneral;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }

    return await this.findOneByUsername(profile.username, profile.username_tag);

    Logger.log('Profile Service createOne ended')
  }

  async UpdateOne(upateProfileDto: UpdateProfileDto, auth_payload_email:string): Promise<Profile | ErrorHttpDto> {
    const queryRunner = this.dataSource.createQueryRunner();

    var profile_result_2 = await this.findOneByUsername(upateProfileDto.username, upateProfileDto.username_tag);
    if(profile_result_2 == null){
      return this.constantService.errorHttpNonExistingProfile
    }

    if(profile_result_2.email != auth_payload_email){
      return this.constantService.errorHttpUnauthorizedAccess
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(Profile, {username: upateProfileDto.username, username_tag: upateProfileDto.username_tag}, upateProfileDto);
  
      await queryRunner.commitTransaction();
      Logger.log('Profile Service UpdateOne reached end of try without error')
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();

      Logger.log('Profile Service createOne error '+err)

      return this.constantService.errorHttpGeneral;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }

    return await this.findOneByUsername(upateProfileDto.username, upateProfileDto.username_tag);
  }

  async remove(id: number): Promise<void> {
    await this.profileRepository.delete(id);
  }
}