// ✅ MIGRATED TO FIREBASE - Final Migration - 2025-01-15
import React, { useState, useEffect } from 'react';
import { MapPin, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { db, doc, setDoc } from '@/integrations/firebase';
import { useToast } from '@/hooks/use-toast';

interface LocationSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const LocationSetup: React.FC<LocationSetupProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [manualLocation, setManualLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      setCoordinates({ lat: latitude, lng: longitude });
      setLocationPermission('granted');

      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://api.mapbox.gl/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbG1vdmc1M3QwdXdoM3FwYjY3M3VhM2R0In0.X3nwCzYtKyH-mXz0zZbJ1Q`
        );
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const place = data.features[0];
          setManualLocation(place.place_name);
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
        setManualLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }

      toast({
        title: "Location Found",
        description: "Your location has been detected successfully.",
      });

    } catch (error) {
      setLocationPermission('denied');
      console.error('Location error:', error);
      
      let message = "Could not get your location. ";
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += "Please enable location access in your browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            message += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message += "Location request timed out.";
            break;
        }
      }
      
      toast({
        title: "Location Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.gl/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbG1vdmc1M3QwdXdoM3FwYjY3M3VhM2R0In0.X3nwCzYtKyH-mXz0zZbJ1Q&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    let finalCoordinates = coordinates;

    // If we have manual location but no coordinates, geocode it
    if (manualLocation && !coordinates) {
      setIsSubmitting(true);
      const geocoded = await geocodeAddress(manualLocation);
      if (geocoded) {
        finalCoordinates = geocoded;
      } else {
        toast({
          title: "Location Not Found",
          description: "Could not find coordinates for the provided address.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    if (!finalCoordinates && !manualLocation) {
      toast({
        title: "Location Required",
        description: "Please provide your location or enter it manually.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        latitude: finalCoordinates?.lat,
        longitude: finalCoordinates?.lng,
        location: manualLocation,
        locationUpdatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "Location Saved",
        description: "Your location has been saved successfully.",
      });

      onComplete();
    } catch (error) {
      console.error('Location update error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <MapPin className="w-5 h-5" />
          Enable Location Services
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Find matches near you with distance-based recommendations
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {locationPermission === 'prompt' && (
            <div className="text-center space-y-3">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      Better Matches
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Location helps us show you compatible matches in your area
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={getCurrentLocation}
                className="w-full"
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <>Getting Location...</>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Use Current Location
                  </>
                )}
              </Button>
            </div>
          )}

          {locationPermission === 'granted' && coordinates && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Location Detected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {manualLocation || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`}
              </p>
            </div>
          )}

          {(locationPermission === 'denied' || locationPermission === 'granted') && (
            <div className="space-y-2">
              <Label htmlFor="manual-location">Or Enter Your Location</Label>
              <Input
                id="manual-location"
                placeholder="City, State or Full Address"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your city, state, or full address
              </p>
            </div>
          )}

          {locationPermission === 'denied' && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    Location Disabled
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Please enter your location manually or enable location access in your browser
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={isSubmitting || (!coordinates && !manualLocation)}
          >
            {isSubmitting ? 'Saving...' : 'Save Location'}
          </Button>

          {onSkip && (
            <Button
              onClick={onSkip}
              variant="ghost"
              className="w-full"
              disabled={isSubmitting}
            >
              Skip for Now
            </Button>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Your exact location is kept private. Only approximate distance is shown to matches.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSetup;