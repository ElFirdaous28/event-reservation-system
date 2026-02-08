import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from '@repo/shared';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) { }

  async seed() {
    const count = await this.userModel.countDocuments();

    if (count > 0) {
      this.logger.log('Users already exist, skipping...');
      return;
    }

    const password = 'password';

    const users = [
      {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: password,
        role: Role.ADMIN,
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        password: password,
        role: Role.PARTICIPANT,
      },
      {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: password,
        role: Role.PARTICIPANT,
      },
      {
        fullName: 'Alice Johnson',
        email: 'alice@example.com',
        password: password,
        role: Role.PARTICIPANT,
      },
      {
        fullName: 'Bob Wilson',
        email: 'bob@example.com',
        password: password,
        role: Role.PARTICIPANT,
      },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await this.userModel.create({
        ...user,
        password: hashedPassword,
      });

    }

    this.logger.log(`Total users seeded: ${users.length}`);
  }
}
