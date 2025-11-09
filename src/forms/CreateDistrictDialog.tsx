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
import { CityDetails } from "@/lib/schema/city.schema";
import { ZoneDetails } from "@/lib/schema/zones.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

type Props = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

export function CreateDistrict({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const form = useForm<DistrictFormData>({
    resolver: zodResolver(DistrictSchema),
    defaultValues: {
      name: "",
      city_id: 0,
      zone_id: null,
    },
  });

  const { data: zones } = useGetZones();
  const { data: cities } = useGetCities();

  const districtMutation = useCreateDistrict();

  const { control } = form;
  async function onSubmit(data: DistrictFormData) {
    try {
      await districtMutation.mutateAsync(
        {
          name: data.name,
          city_id: data.city_id,
          zone_id: data.zone_id,
        },
        {
          onSuccess: (data) => {
            toast.success(t("dialogs.createDistrict.success", { name: data.district.name }));
            onOpenChange(false);
            form.reset();
          },
          onError: (error) => {
            toast.error(`Error: ${error.message}`);
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
      <DialogContent className="sm:max-w-[600px] w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("dialogs.createDistrict.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.createDistrict.description")}
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
                    {t("forms.fields.district")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="name"
                      type="text"
                      placeholder={t("forms.placeholders.enterDistrictName")}
                      disabled={districtMutation.isPending}
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="city_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal">
                    {t("forms.fields.city")}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("forms.placeholders.selectCity")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cities?.cities?.map((city: CityDetails) => (
                        <SelectItem key={city.id} value={String(city.id)}>
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
              name="zone_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-normal">
                    {t("forms.fields.zone")} {t("forms.fields.optional")}
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("forms.placeholders.selectZone")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {zones?.zones?.map((zone: ZoneDetails) => (
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
                <Button variant="outline">{t("forms.actions.cancel")}</Button>
              </DialogClose>
              <Button type="submit">
                {districtMutation.isPending && <Spinner />}
                {t("forms.actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
