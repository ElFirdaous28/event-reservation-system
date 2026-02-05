import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '@repo/shared';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    enum: Role,
    default: Role.PARTICIPANT,
  })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
