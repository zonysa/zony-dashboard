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
import { Dispatch, SetStateAction } from "react";

type CreateZoneProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

export function CreateZone({ open, onOpenChange }: CreateZoneProps) {
  const form = useForm<T>({
    defaultValues: {
      city: "",
      districts: ["", ""],
    },
    mode: "onChange",
  });

  const { control } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={() => console.log("submited")}
              className="space-y-8"
            >
              <FormField
                control={control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seletct City" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent defaultValue="Cairo">
                        <SelectItem value="cairo">Cairo</SelectItem>
                        <SelectItem value="alexandria">Alexandria</SelectItem>
                        <SelectItem value="giza">Giza</SelectItem>
                        <SelectItem value="rayot">Rayot</SelectItem>
                        <SelectItem value="aswan">Aswan</SelectItem>
                        <SelectItem value="luxor">Luxor</SelectItem>
                        <SelectItem value="port-said">Port Said</SelectItem>
                        <SelectItem value="suez">Suez</SelectItem>
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
                    <FormLabel>Districts</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seletct Districts" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent defaultValue="Cairo">
                        <SelectItem value="cairo">Cairo</SelectItem>
                        <SelectItem value="alexandria">Alexandria</SelectItem>
                        <SelectItem value="giza">Giza</SelectItem>
                        <SelectItem value="rayot">Rayot</SelectItem>
                        <SelectItem value="aswan">Aswan</SelectItem>
                        <SelectItem value="luxor">Luxor</SelectItem>
                        <SelectItem value="port-said">Port Said</SelectItem>
                        <SelectItem value="suez">Suez</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
