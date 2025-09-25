"use client";
import { Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Textarea } from "@/components/ui/textarea";

// Define your form type
type TicketActionForm = {
  action: string;
  comment: string;
};

const TicketActionsCell = ({ row }) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const ticket = row.original; // Get all ticket data

  const form = useForm<TicketActionForm>({
    defaultValues: {
      action: "",
      comment: "",
    },
    mode: "onChange",
  });

  const { control, handleSubmit } = form;

  const onSubmit = (data: TicketActionForm) => {
    console.log("Form submitted:", data);
    console.log("Ticket ID:", ticket.id);
    // Handle form submission here
    setSheetOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
        size="icon"
        onClick={() => setSheetOpen(true)}
      >
        <Pen />
        <span className="sr-only">Open menu</span>
      </Button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-[625px] overflow-y-auto px-6">
          <SheetHeader className="px-0">
            <SheetTitle className="text-lg font-semibold">
              Ticket Information
            </SheetTitle>
            <SheetDescription>
              Review ticket details and take action. Click save when done.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-4">
            {/* Ticket Information Display */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Title
                </Label>
                <p className="text-sm">{ticket.title || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Status
                </Label>
                <p className="text-sm">{ticket.status || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Priority
                </Label>
                <p className="text-sm">{ticket.priority || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Assigned To
                </Label>
                <p className="text-sm">{ticket.assignedTo || "Unassigned"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Created Date
                </Label>
                <p className="text-sm">{ticket.createdDate || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Category
                </Label>
                <p className="text-sm">{ticket.category || "N/A"}</p>
              </div>
            </div>

            {ticket.description && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                  {ticket.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Form */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Take Action</h3>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={control}
                  name="action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Action" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="unsolved">Unsolved</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="escalated">Escalated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comment</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add comment for the ticket here..."
                          className="resize-none h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <SheetFooter className="border-t pt-4">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit" onClick={handleSubmit(onSubmit)}>
              Save Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TicketActionsCell;
