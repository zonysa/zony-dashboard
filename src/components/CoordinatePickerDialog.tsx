"use client";

import React, { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

interface CoordinatePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCoordinatesSelect: (lat: number, lng: number) => void;
  initialCoordinates?: { lat: number; lng: number };
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

export const CoordinatePickerDialog: React.FC<CoordinatePickerDialogProps> = ({
  open,
  onOpenChange,
  onCoordinatesSelect,
  initialCoordinates,
}) => {
  const { t } = useTranslation();
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

  // Update manual inputs when position changes from map click
  useEffect(() => {
    if (position) {
      setManualLat(position.lat.toFixed(6));
      setManualLng(position.lng.toFixed(6));
    }
  }, [position]);

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
      <DialogContent className="sm:max-w-[700px] w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("dialogs.coordinatePicker.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.coordinatePicker.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Map Container */}
          <div className="h-[400px] w-full rounded-md border overflow-hidden">
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
            </MapContainer>
          </div>

          {/* Manual Coordinate Input */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">
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
            <div className="space-y-2">
              <Label htmlFor="longitude">
                {t("dialogs.coordinatePicker.longitude")}
              </Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                placeholder={t("dialogs.coordinatePicker.longitudePlaceholder")}
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                onBlur={handleManualUpdate}
              />
            </div>
          </div>

          {position && (
            <div className="text-sm text-muted-foreground">
              {t("dialogs.coordinatePicker.selected")}:{" "}
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </div>
          )}
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
