"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Loader2, MapPin, Search, Store } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useGetBranches } from "@/lib/hooks/useBranch";
import { Branch } from "@/lib/schema/branch.schema";

// Fix for default marker icon in react-leaflet
interface IconDefaultPrototype extends L.Icon.Default {
  _getIconUrl?: string;
}
delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const pudoIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="#f59e0b" stroke="#ffffff" stroke-width="1"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.8" fill="#ffffff"/></svg>`,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

interface CoordinatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCoordinatesSelect: (lat: number, lng: number) => void;
  initialCoordinates?: { lat: number; lng: number };
  /** Show existing PUDO pickup points as markers on the map */
  showPudos?: boolean;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationMarkerProps {
  position: { lat: number; lng: number } | null;
  setPosition: (position: { lat: number; lng: number }) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  position,
  setPosition,
}) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position === null ? null : <Marker position={position} />;
};

// Flies the map to a target set by search, PUDO selection, or geolocation
const FlyTo: React.FC<{
  target: { lat: number; lng: number; id: number } | null;
}> = ({ target }) => {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 15);
    }
  }, [target, map]);

  return null;
};

export const CoordinatePickerDialog: React.FC<CoordinatePickerDialogProps> = ({
  open,
  onOpenChange,
  onCoordinatesSelect,
  initialCoordinates,
  showPudos = false,
}) => {
  const { t, currentLanguage } = useTranslation();
  // Default to Baghdad, Iraq coordinates
  const defaultCenter = { lat: 33.3152, lng: 44.3661 };
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialCoordinates || null
  );
  const [manualLat, setManualLat] = useState<string>(
    initialCoordinates?.lat.toString() || ""
  );
  const [manualLng, setManualLng] = useState<string>(
    initialCoordinates?.lng.toString() || ""
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  // Bump `id` so re-selecting the same place still triggers a fly
  const [flyTarget, setFlyTarget] = useState<{
    lat: number;
    lng: number;
    id: number;
  } | null>(null);
  const flyIdRef = useRef(0);
  const debouncedQuery = useDebounce(searchQuery.trim());

  const { data: branchesData } = useGetBranches(
    { limit: 100 },
    open && showPudos
  );
  const pudos = (branchesData?.pudos || []).filter(
    (pudo: Branch) =>
      pudo.coordinates?.latitude != null && pudo.coordinates?.longitude != null
  );

  // Update manual inputs when position changes from map click
  useEffect(() => {
    if (position) {
      setManualLat(position.lat.toFixed(6));
      setManualLng(position.lng.toFixed(6));
    }
  }, [position]);

  // Geocode the debounced query via OpenStreetMap Nominatim
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=6&accept-language=${currentLanguage}&q=${encodeURIComponent(debouncedQuery)}`,
      { signal: controller.signal }
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((results: SearchResult[]) => {
        setSearchResults(results);
        setIsSearching(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setSearchResults([]);
          setIsSearching(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery, currentLanguage]);

  const flyAndSelect = useCallback((lat: number, lng: number) => {
    setPosition({ lat, lng });
    flyIdRef.current += 1;
    setFlyTarget({ lat, lng, id: flyIdRef.current });
  }, []);

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      flyAndSelect(parseFloat(result.lat), parseFloat(result.lon));
    },
    [flyAndSelect]
  );

  const handlePudoClick = useCallback(
    (pudo: Branch) => {
      flyAndSelect(pudo.coordinates.latitude, pudo.coordinates.longitude);
    },
    [flyAndSelect]
  );

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error(t("dialogs.coordinatePicker.locationError"));
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        flyAndSelect(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setIsLocating(false);
        toast.error(t("dialogs.coordinatePicker.locationError"));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [flyAndSelect, t]);

  const handleManualUpdate = useCallback(() => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      setPosition({ lat, lng });
    }
  }, [manualLat, manualLng]);

  const handleSubmit = useCallback(() => {
    if (position) {
      onCoordinatesSelect(position.lat, position.lng);
      onOpenChange(false);
    }
  }, [position, onCoordinatesSelect, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[min(960px,calc(100%-2rem))] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("dialogs.coordinatePicker.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.coordinatePicker.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
          {/* Sidebar: search + pickup points + manual input */}
          <div className="flex flex-col gap-3 md:h-[460px]">
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="ps-8"
                placeholder={t("dialogs.coordinatePicker.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <Loader2 className="absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-h-[120px] overflow-y-auto rounded-md border">
              {debouncedQuery && (
                <div className="border-b">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                    {t("dialogs.coordinatePicker.searchResults")}
                  </div>
                  {searchResults.length === 0 && !isSearching ? (
                    <div className="px-3 pb-3 text-sm text-muted-foreground">
                      {t("dialogs.coordinatePicker.noResults")}
                    </div>
                  ) : (
                    searchResults.map((result) => (
                      <button
                        key={result.place_id}
                        type="button"
                        className="flex w-full items-start gap-2 px-3 py-2 text-start text-sm hover:bg-accent"
                        onClick={() => handleResultClick(result)}
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="line-clamp-2">
                          {result.display_name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {showPudos && pudos.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                    {t("dialogs.coordinatePicker.pickupPoints")}
                  </div>
                  {pudos.map((pudo: Branch) => (
                    <button
                      key={pudo.id}
                      type="button"
                      className="flex w-full items-start gap-2 px-3 py-2 text-start text-sm hover:bg-accent"
                      onClick={() => handlePudoClick(pudo)}
                    >
                      <Store className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <span>
                        <span className="block font-medium">{pudo.name}</span>
                        <span className="block text-xs text-muted-foreground line-clamp-1">
                          {pudo.address}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="latitude" className="text-xs">
                  {t("dialogs.coordinatePicker.latitude")}
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  placeholder={t("dialogs.coordinatePicker.latitudePlaceholder")}
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  onBlur={handleManualUpdate}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="longitude" className="text-xs">
                  {t("dialogs.coordinatePicker.longitude")}
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  placeholder={t(
                    "dialogs.coordinatePicker.longitudePlaceholder"
                  )}
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  onBlur={handleManualUpdate}
                />
              </div>
            </div>

            {position && (
              <div className="text-xs text-muted-foreground">
                {t("dialogs.coordinatePicker.selected")}:{" "}
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="relative h-[320px] md:h-[460px] w-full rounded-md border overflow-hidden">
            <MapContainer
              center={position || defaultCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
              <FlyTo target={flyTarget} />
              {showPudos &&
                pudos.map((pudo: Branch) => (
                  <Marker
                    key={pudo.id}
                    position={[
                      pudo.coordinates.latitude,
                      pudo.coordinates.longitude,
                    ]}
                    icon={pudoIcon}
                  >
                    <Popup maxWidth={320} minWidth={220}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-semibold leading-snug text-foreground">
                          <Store className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                          {pudo.name}
                        </div>
                        <div className="text-xs leading-snug text-muted-foreground">
                          {pudo.address}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>

            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute bottom-3 end-3 z-[1000] shadow-md"
              title={t("dialogs.coordinatePicker.useCurrentLocation")}
              onClick={handleCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LocateFixed className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t("forms.actions.cancel")}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!position}>
            {t("dialogs.coordinatePicker.confirmLocation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
