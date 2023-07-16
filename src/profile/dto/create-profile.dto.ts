import { IsNotEmpty } from "class-validator";

export class CreateProfileDto{
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    username: string;
    @IsNotEmpty()
    username_tag: string;
    about: string;
    interest: string;    
    display_name: string;    
    gender: string;    
    birthday: Date;    
    height_unit: string;    
    height_value: Number;    
    weight_unit: string;
    weight_value: Number;
}