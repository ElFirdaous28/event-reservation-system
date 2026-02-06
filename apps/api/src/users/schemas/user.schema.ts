import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '@repo/shared';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;
  
  @Prop({
    type: String,
    enum: Role,
    default: Role.PARTICIPANT,
  })
  role: Role;
}

// define the Mongoose document type
export type UserDocument = HydratedDocument<User>;

// create the schema
export const UserSchema = SchemaFactory.createForClass(User);