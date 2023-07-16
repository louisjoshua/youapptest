import { IsNotEmpty } from "class-validator";
import { ProfileDto } from "src/profile/dto/profile.dto";

export class ProfileInfoDto{
    email: string;
    profiles: ProfileDto[];
}