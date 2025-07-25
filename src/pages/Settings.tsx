import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Settings as SettingsIcon, Calendar, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

function Settings() {
  const { session } = useAuth();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      setLoading(true);
      checkGoogleConnection();
    }
  }, [session]);

  const checkGoogleConnection = async () => {
    try {
      if (!session?.user?.id) {
        throw new Error('No authenticated user');
      }
      setError(null);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('google_calendar_token, google_calendar_enabled')
        .eq('id', session?.user.id)
        .single();

      if (error) throw error;
      setGoogleConnected(!!profile?.google_calendar_token);
      setGoogleEnabled(!!profile?.google_calendar_enabled);
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setError('Error al verificar la conexión con Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (!session?.user?.id) {
        throw new Error('No authenticated user');
      }
      setError(null);

      const { access_token } = credentialResponse;
      const { error } = await supabase
        .from('profiles')
        .update({
          google_calendar_token: access_token,
          google_calendar_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', session?.user.id);

      if (error) throw error;
      setGoogleConnected(true);
      setGoogleEnabled(true);
    } catch (error) {
      console.error('Error saving Google credentials:', error);
      setError('Error al conectar con Google Calendar');
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      if (!session?.user?.id) {
        throw new Error('No authenticated user');
      }
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .update({
          google_calendar_token: null,
          google_calendar_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', session?.user.id);

      if (error) throw error;
      setGoogleConnected(false);
      setGoogleEnabled(false);
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      setError('Error al desconectar Google Calendar');
    }
  };

  const handleToggleGoogleCalendar = async () => {
    try {
      if (!session?.user?.id) {
        throw new Error('No authenticated user');
      }
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .update({
          google_calendar_enabled: !googleEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', session?.user.id);

      if (error) throw error;
      setGoogleEnabled(!googleEnabled);
    } catch (error) {
      console.error('Error toggling Google Calendar:', error);
      setError('Error al actualizar la configuración de Google Calendar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Integraciones</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            {/* Google Calendar Integration */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Google Calendar</h3>
                    <p className="text-sm text-gray-500">
                      Sincroniza las citas con tu calendario de Google
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {googleConnected ? (
                    <>
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={googleEnabled}
                            onChange={handleToggleGoogleCalendar}
                          />
                          <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                            googleEnabled ? 'bg-blue-600' : ''
                          }`}></div>
                        </label>
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <Check className="h-4 w-4" />
                          Conectado
                        </span>
                      </div>
                      <button
                        onClick={handleDisconnectGoogle}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Desconectar
                      </button>
                    </>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.error('Google Login Failed')}
                      scope="https://www.googleapis.com/auth/calendar.events"
                      flow="implicit"
                    />
                  )}
                </div>
              </div>
              {googleConnected && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    {googleEnabled
                      ? 'Las citas se sincronizarán automáticamente con tu Google Calendar'
                      : 'La sincronización con Google Calendar está desactivada'}
                  </p>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;