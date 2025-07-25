import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Clock, Package, Settings, Stethoscope, ChevronLeft, ChevronRight, LogOut, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserMenu } from './UserMenu';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className={`fixed left-0 top-0 h-full ${isExpanded ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300`}>
        <div className="p-6">
          <div className={`flex items-center ${isExpanded ? 'gap-2' : 'justify-center'} mb-8`}>
            <Stethoscope className="h-8 w-8 text-blue-600" />
            {isExpanded && <span className="text-xl font-bold text-gray-800">SmileSys</span>}
          </div>
          
          <nav className="space-y-1">
            <Link
              to="/"
              className={`flex items-center ${isExpanded ? 'gap-3 justify-start' : 'justify-center'} px-4 py-3 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
              {isExpanded && 'Inicio'}
            </Link>
            
            <Link
              to="/patients"
              className={`flex items-center ${isExpanded ? 'gap-3 justify-start' : 'justify-center'} px-4 py-3 rounded-lg transition-colors ${
                isActive('/patients')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              {isExpanded && 'Pacientes'}
            </Link>
            
            <Link
              to="/appointments"
              className={`flex items-center ${isExpanded ? 'gap-3 justify-start' : 'justify-center'} px-4 py-3 rounded-lg transition-colors ${
                isActive('/appointments')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Clock className="h-5 w-5 flex-shrink-0" />
              {isExpanded && 'Citas'}
            </Link>
            
            <Link
              to="/calendar"
              className={`flex items-center ${isExpanded ? 'gap-3 justify-start' : 'justify-center'} px-4 py-3 rounded-lg transition-colors ${
                isActive('/calendar')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-5 w-5 flex-shrink-0" />
              {isExpanded && 'Calendario'}
            </Link>
            
            <Link
              to="/inventory"
              className={`flex items-center ${isExpanded ? 'gap-3 justify-start' : 'justify-center'} px-4 py-3 rounded-lg transition-colors ${
                isActive('/inventory')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="h-5 w-5 flex-shrink-0" />
              {isExpanded && 'Inventario'}
            </Link>
            
            <Link
              to="/billing"
              className={`flex items-center ${isExpanded ? 'gap-3 justify-start' : 'justify-center'} px-4 py-3 rounded-lg transition-colors ${
                isActive('/billing')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <DollarSign className="h-5 w-5 flex-shrink-0" />
              {isExpanded && 'Facturación'}
            </Link>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <UserMenu isExpanded={isExpanded} />
          <div className="space-y-2">
            <Link
              to="/settings"
              className={`flex w-full items-center ${isExpanded ? 'gap-3 justify-start' : 'justify-center'} px-4 py-3 ${
                isActive('/settings')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              } rounded-lg transition-colors`}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {isExpanded && 'Configuraciones'}
            </Link>
            <button
              onClick={handleLogout}
              className={`flex w-full items-center ${isExpanded ? 'gap-3 justify-start' : 'justify-center'} px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {isExpanded && 'Cerrar sesión'}
            </button>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>
      </aside>

      <main className={`${isExpanded ? 'ml-64' : 'ml-20'} p-8 transition-all duration-300`}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;