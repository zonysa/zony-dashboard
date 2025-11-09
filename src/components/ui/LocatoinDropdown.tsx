import { CreateZone } from "@/forms/CreateZoneDialog";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateCity } from "@/forms/CreateCityDialog";
import { CreateDistrict } from "@/forms/CreateDistrictDialog";
import { ChevronDown, Pen, Plus, Trash } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

export function LocationDropDown() {
  const { t } = useTranslation();
  // City
  const [openCreateCity, setOpenCreateCity] = useState(false);
  // Zone
  const [openCreateZone, setOpenCreateZone] = useState(false);
  // District
  const [openCreateDistrict, setOpenCreateDistrict] = useState(false);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex justify-between items-stretch bg-primary text-white p-0 border-1 rounded-sm">
            <span className="px-3 text-sm py-1">
              {t("forms.actions.create")}
            </span>
            <div className="flex justify-center items-center border-s px-1">
              <ChevronDown width={18} height={18} />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="flex nowrap px-4 py-4 gap-4 w-auto"
          align="start"
        >
          <DropdownMenuGroup>
            <div>
              <DropdownMenuItem
                className="justify-start cursor-pointer hover:bg-gray-100 px-2"
                onClick={() => setOpenCreateZone(true)}
              >
                <Plus className="rounded px-0.5 w-8 h-8" />
                <span>{t("forms.actions.newZone")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="justify-start cursor-pointer hover:bg-gray-100 px-2"
                onClick={() => setOpenCreateCity(true)}
              >
                <Plus className="rounded px-0.5 w-8 h-8" />
                <span>{t("forms.actions.newCity")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="justify-start cursor-pointer hover:bg-gray-100 px-2"
                onClick={() => setOpenCreateDistrict(true)}
              >
                <Plus className="rounded px-0.5 w-8 h-8" />
                <span>{t("forms.actions.newDistrict")}</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateZone open={openCreateZone} onOpenChange={setOpenCreateZone} />
      <CreateCity open={openCreateCity} onOpenChange={setOpenCreateCity} />
      <CreateDistrict
        open={openCreateDistrict}
        onOpenChange={setOpenCreateDistrict}
      />
    </div>
  );
}
