import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/spinner";
import { DistrictFormData, DistrictSchema } from "@/lib/schema/district.schema";
import { useCreateDistrict } from "@/lib/hooks/useDistrict";
import { useGetZones } from "@/lib/hooks/useZone";
import { useGetCities } from "@/lib/hooks/useCity";
import { ZoneRes } from "@/lib/schema/zones.schema";
import { CityRes } from "@/lib/schema/city.schema";

type Props = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

export function CreateDistrict({ open, onOpenChange }: Props) {
  const form = useForm<DistrictFormData>({
    resolver: zodResolver(DistrictSchema),
    defaultValues: {
      name: "",
      // zone: "",
      city: "",
    },
  });

  const { data: zones } = useGetZones();
  const { data: cities } = useGetCities();

  const districtMutation = useCreateDistrict();

  const { control } = form;
  async function onSubmit(data: DistrictFormData) {
    console.log(data);
    try {
      await districtMutation.mutateAsync(
        {
          name: data.name,
          city_id: Number(data.city),
          // zone_id: Number(data.zone),
        },
        {
          onSuccess: () => {
            toast.success(`District ${data.name} created successfuly`);
            onOpenChange(false);
            form.reset();
          },
          onError: (error) => {
            toast.error(`Error ${error.message}`);
          },
        }
      );

      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Error", {
        description: `${error}`,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New District</DialogTitle>
          <DialogDescription>
            Make changes to your profile here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  <FormLabel htmlFor="name" className="font-normal">
                    District Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="name"
                      type="text"
                      placeholder="Enter District Name"
                      disabled={districtMutation.isPending}
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal">City</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seletct City" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cities?.cities?.map((city: CityRes) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="zone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal">Zone (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seletct Zone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {zones?.zones?.map((zone: ZoneRes) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">
                {districtMutation.isPending && <Spinner />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
