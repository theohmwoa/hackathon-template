import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const supabase = this.supabaseService.getClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: createUserDto.email,
      password: createUserDto.password,
      email_confirm: true,
    });

    if (authError) {
      this.logger.error(`Failed to create user: ${authError.message}`);
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    // Create user profile (if you have a users table)
    // const { data: userData, error: userError } = await supabase
    //   .from('users')
    //   .insert({
    //     id: authData.user.id,
    //     email: createUserDto.email,
    //     name: createUserDto.name,
    //   })
    //   .select()
    //   .single();

    // if (userError) {
    //   this.logger.error(`Failed to create user profile: ${userError.message}`);
    //   throw new Error(`Failed to create user profile: ${userError.message}`);
    // }

    return {
      id: authData.user.id,
      email: authData.user.email,
      name: createUserDto.name,
      created_at: new Date(authData.user.created_at),
      updated_at: new Date(authData.user.updated_at),
    };
  }

  async findAll(): Promise<User[]> {
    const supabase = this.supabaseService.getClient();

    // Example: fetch from users table
    // const { data, error } = await supabase.from('users').select('*');

    // if (error) {
    //   this.logger.error(`Failed to fetch users: ${error.message}`);
    //   throw new Error(`Failed to fetch users: ${error.message}`);
    // }

    // return data;

    // For now, return empty array (implement when you have users table)
    return [];
  }

  async findOne(id: string): Promise<User> {
    const supabase = this.supabaseService.getClient();

    // Example: fetch from users table
    // const { data, error } = await supabase
    //   .from('users')
    //   .select('*')
    //   .eq('id', id)
    //   .single();

    // if (error) {
    //   this.logger.error(`Failed to fetch user: ${error.message}`);
    //   throw new NotFoundException(`User with ID ${id} not found`);
    // }

    // return data;

    throw new NotFoundException(`User with ID ${id} not found`);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const supabase = this.supabaseService.getClient();

    // Example: update users table
    // const { data, error } = await supabase
    //   .from('users')
    //   .update({
    //     name: updateUserDto.name,
    //     bio: updateUserDto.bio,
    //     updated_at: new Date().toISOString(),
    //   })
    //   .eq('id', id)
    //   .select()
    //   .single();

    // if (error) {
    //   this.logger.error(`Failed to update user: ${error.message}`);
    //   throw new NotFoundException(`User with ID ${id} not found`);
    // }

    // return data;

    throw new NotFoundException(`User with ID ${id} not found`);
  }

  async remove(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      this.logger.error(`Failed to delete user: ${authError.message}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Delete from users table if exists
    // const { error: dbError } = await supabase.from('users').delete().eq('id', id);

    // if (dbError) {
    //   this.logger.error(`Failed to delete user profile: ${dbError.message}`);
    // }
  }
}
