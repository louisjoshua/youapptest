import { User } from 'src/user/user.entity';
import { 
    Entity, Unique, 
    Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ObjectIdColumn, ObjectId, ManyToOne } from 'typeorm';

@Entity()
@Unique(["username","username_tag"])
export class Profile {
    @ObjectIdColumn()
    public id: ObjectId;

    @Column()
    email: string;

    @Column()
    username: string;

    @Column()
    username_tag: string;

    @Column()
    about: string;

    @Column({ default: "" })
    interest: string;

    //About
    @Column()
    display_name: string;

    @Column()
    gender: string;

    @Column()
    birthday: Date;

    @Column()
    height_unit: string;
    @Column()
    height_value: Number;
    @Column()
    weight_unit: string;
    @Column()
    weight_value: Number;

    @ManyToOne((type) => User, (user) => user.profiles)
    user: User

    //System
    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}