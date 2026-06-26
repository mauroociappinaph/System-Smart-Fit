import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import {
  createSupabaseClient,
  createSupabaseAdminClient,
} from './supabase-client.factory';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: SupabaseClient,
      useFactory: () => createSupabaseClient(),
    },
    {
      provide: 'SUPABASE_ADMIN_CLIENT',
      useFactory: () => createSupabaseAdminClient(),
    },
    AuthService,
    SupabaseAuthGuard,
    { provide: APP_GUARD, useExisting: SupabaseAuthGuard },
    RolesGuard,
  ],
  exports: [SupabaseAuthGuard, RolesGuard],
})
export class AuthModule {}
