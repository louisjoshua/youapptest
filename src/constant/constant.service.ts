import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ErrorHttpDto } from './dto/error-http.dto';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class ConstantService {
  constructor() {}

  errorHttpGeneral : ErrorHttpDto = new ErrorHttpDto("001","General error please contact IT")
  errorHttpExistingEmail : ErrorHttpDto = new ErrorHttpDto("002","Email already used")
  errorHttpExistingUsername : ErrorHttpDto = new ErrorHttpDto("003","Username already used")
  errorHttpExistingWrongCredential : ErrorHttpDto = new ErrorHttpDto("004","The login credentials are incorrect")
  errorHttpMissingField : ErrorHttpDto = new ErrorHttpDto("005","Missing important fields")
  errorHttpUnauthorizedAccess : ErrorHttpDto = new ErrorHttpDto("006","Unauthorized access")
  errorHttpNonExistingProfile : ErrorHttpDto = new ErrorHttpDto("007","Profile does not exist")

  GetTimeOfYear(date:Date): Number{
    Logger.log('Constant.Service GetTimeOfYear date '+date)
    var start = new Date(date.getFullYear(), 0, 0);
    var time_difference = date.getTime() - start.getTime();
    return Math.floor(time_difference / (1000 * 3600 * 24));
  }

  GetHoroscope(dob: Date): string{
    if(dob == null) return "-"

    var dob_toy = this.GetTimeOfYear(dob);

    if(dob_toy >= this.GetTimeOfYear(new Date(dob.getFullYear(), 0, 19))  && dob_toy <= this.GetTimeOfYear(new Date(dob.getFullYear(), 1, 17))){
      return "Aquarius"
    }
    else if(dob_toy >= this.GetTimeOfYear(new Date(dob.getFullYear(), 1, 18))  && dob_toy <= this.GetTimeOfYear(new Date(dob.getFullYear(), 2, 19))){
      return "Pisces"
    }
    else if(dob_toy >= this.GetTimeOfYear(new Date(dob.getFullYear(), 2, 20))  && dob_toy <= this.GetTimeOfYear(new Date(dob.getFullYear(), 3, 18))){
      return "Aries"
    }
    else if(dob_toy >= this.GetTimeOfYear(new Date(dob.getFullYear(), 3, 19))  && dob_toy <= this.GetTimeOfYear(new Date(dob.getFullYear(), 4, 19))){
      return "Taurus"
    }
    else if(dob_toy >= this.GetTimeOfYear(new Date(dob.getFullYear(), 4, 20))  && dob_toy <= this.GetTimeOfYear(new Date(dob.getFullYear(), 5, 20))){
      return "Gemini"
    }
    else if(dob_toy >= this.GetTimeOfYear(new Date(dob.getFullYear(), 5, 21))  && dob_toy <= this.GetTimeOfYear(new Date(dob.getFullYear(), 6, 21))){
      return "Cancer"
    }
    else if(dob_toy >= this.GetTimeOfYear(new Date(dob.getFullYear(), 6, 23))  && dob_toy <= this.GetTimeOfYear(new Date(dob.getFullYear(), 7, 21))){
      return "Leo"
    }
    else if(dob_toy >= this.GetTimeOfYear(new Date(dob.getFullYear(), 7, 22))  && dob_toy <= this.GetTimeOfYear(new Date(dob.getFullYear(), 8, 21))){
      return "Virgo"
    }
    else if(dob_toy >= this.GetTimeOfYear(new Date(dob.getFullYear(), 8, 22))  && dob_toy <= this.GetTimeOfYear(new Date(dob.getFullYear(), 9, 22))){
      return "Libra"
    }
    else if(dob_toy >= this.GetTimeOfYear(new Date(dob.getFullYear(), 9, 23))  && dob_toy <= this.GetTimeOfYear(new Date(dob.getFullYear(), 10, 20))){
      return "Scorpius"
    }
    else if(dob_toy >= this.GetTimeOfYear(new Date(dob.getFullYear(), 10, 21))  && dob_toy <= this.GetTimeOfYear(new Date(dob.getFullYear(), 11, 20))){
      return "Sagittarius"
    }
    else{
      return "Capricornus"
    }
  }

  GetZodiac(dob: Date): string{
    if(dob == null) return "-";

    const year = dob.getFullYear();
    const month = dob.getMonth() + 1;

    const zodiacs = [
      'Rat',
      'Ox',
      'Tiger',
      'Rabbit',
      'Dragon',
      'Snake',
      'Horse',
      'Sheep',
      'Monkey',
      'Rooster',
      'Dog',
      'Pig'
    ];

    let index = (year - 1900) % 12;

    if (month < 2) {
      index = (index - 1 + 12) % 12;
    }

    return zodiacs[index];
    
  }

  async HashPassword(password: string): Promise<string>{
    var saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }
}

export const multerConfig = {
  dest: "public/",
};

export const multerOptionsProfile = {
  fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        cb(null, true);
      } else {
        cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
      }
  },
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = multerConfig.dest;
      if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req: any, file: any, cb: any) => {
      cb(null, `${req.username}.${req.username_tag}${extname(file.originalname)}`);
    },
  }),
};