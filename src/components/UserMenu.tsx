import React, { useState } from 'react';
import { User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface UserMenuProps {
  isExpanded: boolean;
}

export function UserMenu({ isExpanded }: UserMenuProps) {
  const { session } = useAuth();

  if (!session?.user) return null;

  return (
    <div className={`flex items-center ${isExpanded ? 'w-full gap-2' : 'justify-center'} px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors`}>
      <div className="bg-blue-100 p-2 rounded-full">
        <User className="h-5 w-5 text-blue-600" />
      </div>
      {isExpanded && <span className="text-sm text-gray-700">{session.user.email}</span>}
    </div>
  );
}