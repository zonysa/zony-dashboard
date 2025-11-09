import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dispatch, SetStateAction, useMemo } from "react";
import { ZoneFormData } from "@/lib/schema/zones.schema";
import { Input } from "@/components/ui/input";
import { useCreateZone } from "@/lib/hooks/useZone";
import { useGetCities } from "@/lib/hooks/useCity";
import { toast } from "sonner";
import { useGetDistricts } from "@/lib/hooks/useDistrict";
import { DistrictDetails } from "@/lib/schema/district.schema";
import { Spinner } from "@/components/ui/spinner";
import MultipleSelector from "@/components/ui/multiple-selector";
import { CityDetails } from "@/lib/schema/city.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

type CreateZoneProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

type DistrictToOPtion = {
  label: string;
  value: string;
};

export function CreateZone({ open, onOpenChange }: CreateZoneProps) {
  const { t } = useTranslation();

  const form = useForm<ZoneFormData>({
    defaultValues: {
      name: "",
      city_id: 0,
      districts: [],
    },
    mode: "onChange",
  });

  const cityId = form.watch("city_id");
  const { data: districts } = useGetDistricts(Number(cityId) ?? null);
  const { data: cities } = useGetCities();

  const zoneMutation = useCreateZone();

  const { isValid, isDirty } = form.formState;

  // Convert districts to Options format for MultipleSelector
  const districtOptions: DistrictToOPtion[] = useMemo(() => {
    if (!districts?.districts) return [];

    return districts.districts.map((district: DistrictDetails) => ({
      label: district.name,
      value: district.id?.toString() || "",
    }));
  }, [districts]);

  const { control } = form;

  async function onSubmit(data: ZoneFormData) {
    try {
      await zoneMutation.mutateAsync(
        {
          name: data.name,
          city_id: Number(data.city_id), // Convert to number for API
          status: "active",
          // districts: data.districts.map(d => Number(d.value))
        },
        {
          onSuccess: () => {
            toast.success(`Zone ${data.name} created successfuly`);
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
      <DialogContent className="sm:max-w-[625px] w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("dialogs.createZone.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.createZone.description")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              // className="flex flex-col gap-6"
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid gap-3">
                  <FormLabel htmlFor="name" className="font-normal">
                    {t("forms.fields.zoneName")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="name"
                      type="text"
                      placeholder={t("forms.placeholders.enterZoneName")}
                      disabled={zoneMutation.isPending}
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
                  <FormLabel>{t("forms.fields.city")}</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                      // form.setValue("districts", []);
                    }}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t("forms.placeholders.selectCity")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent defaultValue="Cairo">
                      {cities?.cities.map((city: CityDetails) => (
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
              name="districts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("forms.fields.districts")}</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      value={field.value}
                      onChange={field.onChange}
                      defaultOptions={districtOptions}
                      placeholder={
                        !cityId
                          ? t("forms.placeholders.selectCityFirst")
                          : t("forms.placeholders.selectDistricts")
                      }
                      disabled={!cityId || zoneMutation.isPending}
                      hidePlaceholderWhenSelected
                      emptyIndicator={
                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                          {!cityId
                            ? t("forms.placeholders.noCitySelected")
                            : t("forms.placeholders.noDistrictsFound")}
                        </p>
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                disabled={zoneMutation.isPending || !isValid || !isDirty}
                type="submit"
              >
                {zoneMutation.isPending && <Spinner />}
                {t("forms.actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
