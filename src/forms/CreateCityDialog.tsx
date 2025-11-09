import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import { CityFormData, CitySchema } from "@/lib/schema/city.schema";

import {
  Dialog,
  DialogClose,
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateCity } from "@/lib/hooks/useCity";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/lib/hooks/useTranslation";

type Props = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

export function CreateCity({ open, onOpenChange }: Props) {
  const { t } = useTranslation();

  const form = useForm<CityFormData>({
    resolver: zodResolver(CitySchema),
    defaultValues: {
      name: "",
    },
  });

  const cityMutation = useCreateCity();

  function onSubmit(data: CityFormData) {
    cityMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Created New City");
      },
      onError: (error) =>
        toast.error("Error", {
          description: `The ${error.message} problem`,
        }),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("dialogs.createCity.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.createCity.description")}
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
                    {t("forms.fields.cityName")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="name"
                      type="text"
                      placeholder={t("forms.placeholders.enterCityName")}
                      disabled={cityMutation.isPending}
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("forms.actions.cancel")}</Button>
              </DialogClose>
              <Button type="submit">
                {cityMutation.isPending && <Spinner />}
                {t("forms.actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
