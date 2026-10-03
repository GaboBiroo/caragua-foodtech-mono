import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useAppStore } from '@/store/useAppStore';
import type { UserLocation } from '@/types';

// ==============================================================================
// useLocation — Contexto de Geolocalização Hiperlocal (Caraguatatuba)
// Gerencia a permissão e obtenção contínua de GPS, com ancoragem de segurança
// no Centro de Caraguatatuba (-23.6226, -45.4124) em caso de bloqueio.
// ==============================================================================

const CARAGUA_CENTER: UserLocation = {
  latitude: -23.6226,
  longitude: -45.4124,
  neighborhood: 'Centro',
};

export function useLocation() {
  const { location, setLocation } = useAppStore();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function requestAndFetchLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) return;

        if (status !== 'granted') {
          setHasPermission(false);
          setErrorMsg('Permissão de GPS negada. Usando localização padrão (Caraguatatuba Centro).');
          setLocation(CARAGUA_CENTER);
          setIsLoading(false);
          return;
        }

        setHasPermission(true);
        const currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;

        setLocation({
          latitude: currentLoc.coords.latitude,
          longitude: currentLoc.coords.longitude,
          neighborhood: 'Caraguatatuba',
        });
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMsg(err.message || 'Erro ao capturar GPS');
        setLocation(CARAGUA_CENTER);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    requestAndFetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    location,
    hasPermission,
    isLoading,
    errorMsg,
  };
}

export default useLocation;
