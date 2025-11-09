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
import { TicketDetails } from "@/lib/schema/tickets.schema";
import { Row } from "@tanstack/react-table";
import { t } from "i18next";
import { useUpdateTicket } from "@/lib/hooks/useTicket";
import { Spinner } from "./ui/spinner";

// Define your form type
type TicketActionForm = {
  action_taken:
    | "pending"
    | "in_progress"
    | "resolved"
    | "escalated"
    | "cancelled";
  comment: string;
};

type TicketActionsCellProps = {
  row: Row<TicketDetails>;
};

const TicketActionsCell = ({ row }: TicketActionsCellProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const ticket = row.original; // Get all ticket data
  const updateTicketMutation = useUpdateTicket();

  const form = useForm<TicketActionForm>({
    defaultValues: {
      action_taken: "pending",
      comment: "",
    },
    mode: "onChange",
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: TicketActionForm) => {
    try {
      await updateTicketMutation.mutateAsync({
        id: ticket.id.toString(),
        data: {
          action_taken: data.action_taken,
          comment: data.comment,
        },
      });

      // Reset form and close sheet on success
      reset();
      setSheetOpen(false);
    } catch (error) {
      // Error is handled by the mutation's onError
      console.error("Error updating ticket:", error);
    }
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
              {t("dialogs.ticket.title")}
            </SheetTitle>
            <SheetDescription>
              {t("dialogs.ticket.description")}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-4">
            {/* Ticket Information Display */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {t("dialogs.ticket.trackingNumber")}
                </Label>
                <p className="text-sm">{ticket.tracking_number || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {t("dialogs.ticket.id")}
                </Label>
                <p className="text-sm">{ticket.id || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {t("dialogs.ticket.status")}
                </Label>
                <p className="text-sm">{ticket.status || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {t("dialogs.ticket.actionTaken")}
                </Label>
                <p className="text-sm">{ticket.action_taken || "N/A"}</p>
              </div>
              {/* <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Assigned To
                </Label>
                <p className="text-sm">{ticket.assignedTo || "Unassigned"}</p>
              </div> */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Created Date
                </Label>
                <p className="text-sm">{ticket.created_at || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Zone Name
                </Label>
                <p className="text-sm">{ticket.zone_name || "N/A"}</p>
              </div>
            </div>

            {ticket.comment && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                  {ticket.comment}
                </p>
              </div>
            )}
          </div>

          {/* Action Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">
                  {t("dialogs.ticket.actions.title")}
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="action_taken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("dialogs.ticket.actions.actionLabel")}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={t(
                                  "dialogs.ticket.actions.actionPlaceholder"
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="escalated">Escalated</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("dialogs.ticket.actions.commentLabel")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t(
                              "dialogs.ticket.actions.commentPlaceholder"
                            )}
                            className="resize-none h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <SheetFooter className="border-t pt-4">
                <Button type="submit" disabled={updateTicketMutation.isPending}>
                  {updateTicketMutation.isPending ? (
                    <Spinner>{t("common.loading")}</Spinner>
                  ) : (
                    t("dialogs.ticket.actions.saveChanges")
                  )}
                </Button>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    disabled={updateTicketMutation.isPending}
                  >
                    {t("dialogs.ticket.actions.cancel")}
                  </Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TicketActionsCell;
