import { Controller, Get, Post, Put, Req, Res, Body, HttpStatus, HttpException, UseGuards, UploadedFile, UseInterceptors, ParseFilePipeBuilder } from '@nestjs/common';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

import { UserService } from './user.service';
import { User } from './user.entity';
import { RegisterUserDto } from './dto/register-user.dto';

import { Logger } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { ConstantService, multerConfig, multerOptionsProfile } from 'src/constant/constant.service';

import {AuthGuard} from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from 'src/profile/profile.service';
import { Profile } from 'src/profile/profile.entity';
import { ProfileDto } from 'src/profile/dto/profile.dto';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';
import { UpdateProfileDto } from 'src/profile/dto/update-profile.dto';
import { ObjectId } from 'typeorm';
import { ProfileInfoDto } from './dto/profile-info.dto';

@Controller('api')
export class UserController {
    constructor(
        private authService: AuthService,
        private constantService: ConstantService,
        private userService: UserService,
        private profileService: ProfileService
    ) {}

    @Post("register")
    async register(@Req() request: Request, @Res() res: Response, @Body()body: RegisterUserDto) {
        Logger.log('User Controller body email '+body.email)

        var result = await this.userService.createOne(body);

        Logger.log('User Controller typeof result '+typeof result)

        if(!(result instanceof User)){
            throw new HttpException(result, HttpStatus.BAD_REQUEST);
        }

        res.status(HttpStatus.CREATED).send();
    }

    @Post("login")
    async login(@Req() request: Request, @Res() res: Response, @Body()body: LoginDto) {
        var user_account = await this.userService.findOneByEmail(body.email)

        if(user_account == null){
            throw new HttpException(this.constantService.errorHttpExistingWrongCredential, HttpStatus.BAD_REQUEST);
        }

        Logger.log('User Controller login user_account is not null')
        Logger.log('User Controller login user_account user_account.password '+user_account.password)
        Logger.log('User Controller login user_account await this.constantService.HashPassword(body.password) '+await this.constantService.HashPassword(body.password))
        
        if(await bcrypt.compare(body.password, user_account.password) === false)
        // if( user_account.password != await this.constantService.HashPassword(body.password))
        {
            throw new HttpException(this.constantService.errorHttpExistingWrongCredential, HttpStatus.BAD_REQUEST);
        }

        var result = await this.authService.signIn(body.email, body.password);

        res.status(HttpStatus.CREATED).send(result);
    }

    
    @UseGuards(AuthGuard)
    @Get("getProfile")
    async GetProfile(@Req() request, @Res() res: Response) {
        // return 'Collected profile '+ request.user_payload.email;
        var user_account = await this.userService.findOneByEmail(request.user_payload.email)
        if(user_account == null){
            throw new HttpException(this.constantService.errorHttpExistingWrongCredential, HttpStatus.BAD_REQUEST);
        }

        // var profiles: Profile[] = user_account.profiles;
        // Logger.log("User Controller profileService.findByEmail finished");
        // if(profiles == null){
        //     throw new HttpException(this.constantService.errorHttpExistingWrongCredential, HttpStatus.BAD_REQUEST);
        // }

        var profiles: Profile[] = await this.profileService.findByEmail(request.user_payload.email);

        var types = [".jpg",".jpeg",".png"];

        var response_body: ProfileInfoDto = new ProfileInfoDto();
        response_body.email = request.user_payload.email;
        response_body.profiles = [];

        profiles.forEach(async profile => {
            var temp_prod_dto = new ProfileDto();
            temp_prod_dto.email =  profile.email;
            temp_prod_dto.username = profile.username;
            temp_prod_dto.username_tag = profile.username_tag;
            temp_prod_dto.about =  profile.about;
            temp_prod_dto.interest = profile.interest;     
            temp_prod_dto.display_name = profile.display_name;     
            temp_prod_dto.gender = profile.gender;     
            temp_prod_dto.birthday = profile.birthday;   
            temp_prod_dto.height_unit = profile.height_unit;     
            temp_prod_dto.height_value = profile.height_value;  
            temp_prod_dto.weight_unit = profile.weight_unit; 
            temp_prod_dto.weight_value = profile.weight_value;
            temp_prod_dto.horoscope = this.constantService.GetHoroscope(temp_prod_dto.birthday);
            temp_prod_dto.zodiac = this.constantService.GetZodiac(temp_prod_dto.birthday); 

            types.forEach(element => {
                Logger.log('loop '+temp_prod_dto.email+element)
                var image_path = multerConfig.dest+temp_prod_dto.email+element;
                if (fs.existsSync(image_path)) {
                    var bitmap = fs.readFileSync(image_path);
                    temp_prod_dto.profile_pic = new Buffer(bitmap).toString('base64');
                    temp_prod_dto.profile_pic_type = element;
                }
            });

            response_body.profiles = response_body.profiles.concat([temp_prod_dto]);
        });

        res.status(HttpStatus.CREATED).send(response_body);
    }

    @UseGuards(AuthGuard)
    @Post("createProfile")
    @UseInterceptors(FileInterceptor('file', multerOptionsProfile))
    async CreateProfile(@Req() request, @Res() res: Response, @Body()body: UpdateProfileDto, @UploadedFile() file?: Express.Multer.File) {
        var user_account = await this.userService.findOneByEmail(request.user_payload.email);
        if(user_account == null){
            throw new HttpException(this.constantService.errorHttpExistingWrongCredential, HttpStatus.BAD_REQUEST);
        }

        if(typeof body.birthday == 'string'){
            body.birthday = new Date(body.birthday);
        }

        var result = await this.profileService.UpdateOne(body, request.user_payload.email);

        if(!(result instanceof Profile)){
            throw new HttpException(result, HttpStatus.BAD_REQUEST);
        }

        // await this.userService.AddProfile(request.user_payload.email, result)

        res.status(HttpStatus.ACCEPTED).send();
    }

    @UseGuards(AuthGuard)
    @Post("updateProfile")
    @UseInterceptors(FileInterceptor('file', multerOptionsProfile))
    async UpdateProfile(@Req() request, @Res() res: Response, @Body()body: UpdateProfileDto, @UploadedFile() file?: Express.Multer.File) {
        var user_account = await this.userService.findOneByEmail(request.user_payload.email);
        if(user_account == null){
            throw new HttpException(this.constantService.errorHttpExistingWrongCredential, HttpStatus.BAD_REQUEST);
        }

        if(typeof body.birthday == 'string'){
            body.birthday = new Date(body.birthday);
        }

        var result = await this.profileService.UpdateOne(body,request.user_payload.email);

        if(!(result instanceof Profile)){
            throw new HttpException(result, HttpStatus.BAD_REQUEST);
        }

        res.status(HttpStatus.ACCEPTED).send();
    }
}
