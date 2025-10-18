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

type Props = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

export function CreateCity({ open, onOpenChange }: Props) {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New City</DialogTitle>
          <DialogDescription>
            Make changes to your profile here.
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
                    City Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="name"
                      type="text"
                      placeholder="Enter City Name"
                      disabled={cityMutation.isPending}
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">
                {cityMutation.isPending && <Spinner />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
