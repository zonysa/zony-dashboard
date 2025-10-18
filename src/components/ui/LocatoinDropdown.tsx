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

export function LocationDropDown() {
  const [openCreateZone, setOpenCreateZone] = useState(false);
  const [openCreateCity, setOpenCreateCity] = useState(false);
  const [openCreateDistrict, setOpenCreateDistrict] = useState(false);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex justify-between items-stretch bg-primary text-white p-0 border-1 rounded-sm">
            <span className="px-3 text-sm py-1">Create</span>
            <div className="flex justify-center items-center border-s-1 px-1">
              <ChevronDown width={18} height={18} />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="flex nowrap px-4 py-4 gap-4 w-auto"
          align="start"
        >
          <DropdownMenuGroup>
            <span className="text-center">Zone</span>
            <div>
              <DropdownMenuItem
                className="justify-start cursor-pointer hover:bg-gray-100 px-2"
                onClick={() => setOpenCreateCity(true)}
              >
                <Plus width={30} height={30} className="rounded px-0.5" />
                <span>Create</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="justify-start cursor-pointer hover:bg-gray-100 px-4"
                onClick={() => setOpenCreateZone(true)}
              >
                <Pen width={30} height={30} className="rounded px-0.5" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="justify-start cursor-pointer hover:bg-gray-100 px-4"
                onClick={() => setOpenCreateDistrict(true)}
              >
                <Trash width={30} height={30} className="rounded px-0.5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuGroup>
          <div className="w-[1px] bg-gray-300 h-auto"></div>
          <DropdownMenuGroup>
            <span className="text-center">City</span>
            <div>
              <DropdownMenuItem
                className="justify-start cursor-pointer hover:bg-gray-100 px-4"
                onClick={() => setOpenCreateCity(true)}
              >
                <Plus width={30} height={30} className="rounded px-0.5" />
                <span>Create</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="justify-start cursor-pointer hover:bg-gray-100 px-4"
                onClick={() => setOpenCreateZone(true)}
              >
                <Pen width={30} height={30} className="rounded px-0.5" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="justify-start cursor-pointer hover:bg-gray-100 px-4"
                onClick={() => setOpenCreateDistrict(true)}
              >
                <Trash width={30} height={30} className="rounded px-0.5" />
                <span>Delete</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuGroup>
          <div className="w-[1px] bg-gray-300 h-auto"></div>
          <DropdownMenuGroup>
            <span className="w-full text-center">District</span>
            <div>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="justify-start cursor-pointer hover:bg-gray-100 px-4"
                  onClick={() => setOpenCreateCity(true)}
                >
                  <Plus width={30} height={30} className="rounded px-0.5" />
                  <span>Create</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="justify-start cursor-pointer hover:bg-gray-100 px-4"
                  onClick={() => setOpenCreateZone(true)}
                >
                  <Pen width={30} height={30} className="rounded px-0.5" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="justify-start cursor-pointer hover:bg-gray-100 px-4"
                  onClick={() => setOpenCreateDistrict(true)}
                >
                  <Trash width={30} height={30} className="rounded px-0.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
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
