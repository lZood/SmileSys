import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Settings as SettingsIcon, Calendar, Check, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

function Settings() {
  const { session } = useAuth();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      checkGoogleConnection();
    } else {
      setLoading(false);
    }
  }, [session]);

  const checkGoogleConnection = async () => {
    try {
      if (!session?.user?.id) return;
      
      setLoading(true);
      setError(null);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('google_calendar_token, google_calendar_enabled')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore 'no rows found' error
        throw error;
      }
      
      setGoogleConnected(!!profile?.google_calendar_token);
      setGoogleEnabled(!!profile?.google_calendar_enabled);

    } catch (error) {
      console.error('Error checking Google connection:', error);
      setError('Error al verificar la conexión con Google Calendar.');
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
      
      // The access token is usually found in the `access_token` field of the response.
      // Depending on the flow, it might be in `credentialResponse.access_token`
      // or you might receive an authorization code to exchange for a token.
      // Let's assume you're using a flow that directly gives you an access token.
      const accessToken = credentialResponse.access_token;

      if (!accessToken) {
        throw new Error('Access token not found in Google response.');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          google_calendar_token: accessToken,
          google_calendar_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;
      setGoogleConnected(true);
      setGoogleEnabled(true);
    } catch (error) {
      console.error('Error saving Google credentials:', error);
      setError('Error al conectar con Google Calendar. Por favor, inténtelo de nuevo.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    setError('El inicio de sesión con Google falló. Por favor, inténtelo de nuevo.');
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
        .eq('id', session.user.id);

      if (error) throw error;
      setGoogleConnected(false);
      setGoogleEnabled(false);
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      setError('Error al desconectar Google Calendar.');
    }
  };

  const handleToggleGoogleCalendar = async () => {
    if (!googleConnected) return;

    try {
      if (!session?.user?.id) {
        throw new Error('No authenticated user');
      }
      setError(null);

      const newEnabledState = !googleEnabled;
      const { error } = await supabase
        .from('profiles')
        .update({
          google_calendar_enabled: newEnabledState,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) throw error;
      setGoogleEnabled(newEnabledState);
    } catch (error) {
      console.error('Error toggling Google Calendar:', error);
      setError('Error al actualizar la configuración de Google Calendar.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Integraciones</h2>
          <p className="text-sm text-gray-500 mt-1">
            Conecta tus aplicaciones para automatizar tu flujo de trabajo.
          </p>
        </div>
        
        <div className="p-6">
          <div className="border rounded-lg p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Google Calendar</h3>
                  <p className="text-sm text-gray-500">
                    Sincroniza las citas con tu calendario de Google.
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex items-center gap-4">
                {googleConnected ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <Check className="h-5 w-5" />
                      Conectado
                    </div>
                    <button
                      onClick={handleDisconnectGoogle}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Desconectar
                    </button>
                  </>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    scope="https://www.googleapis.com/auth/calendar.events"
                    flow="implicit" 
                  />
                )}
              </div>
            </div>

            {googleConnected && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    {googleEnabled
                      ? 'La sincronización de citas está activada.'
                      : 'La sincronización de citas está desactivada.'}
                  </p>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={googleEnabled}
                      onChange={handleToggleGoogleCalendar}
                      disabled={!googleConnected}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;