import { Profile } from 'src/profile/profile.entity';
import { 
    Entity, Unique, 
    Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ObjectIdColumn, ObjectId, OneToMany } from 'typeorm';

@Entity()
@Unique(["email"])
export class User {
    @ObjectIdColumn()
    public id: ObjectId;

    @Column()
    email: string;

    @Column({ nullable: false })
    password: string;

    @OneToMany((type) => Profile, (profile) => profile.user)
    profiles: Profile[];

    //System
    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}