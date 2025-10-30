"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

interface NotificationsSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const NotificationsSheet = ({
  open,
  onOpenChange,
}: NotificationsSheetProps) => {
  // Mock notifications data - replace with actual data fetching
  const notifications: Notification[] = [
    {
      id: "1",
      title: "New Ticket Assigned",
      message: "You have been assigned to ticket #1234",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
    },
    {
      id: "2",
      title: "Parcel Delivered",
      message: "Parcel #5678 has been successfully delivered",
      type: "success",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
    {
      id: "3",
      title: "Delayed Delivery",
      message: "Parcel #9012 delivery is delayed",
      type: "warning",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: true,
    },
    {
      id: "4",
      title: "Failed Delivery",
      message: "Parcel #3456 delivery failed - customer not available",
      type: "error",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "error":
        return "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = (id: string) => {
    // Implement mark as read functionality
    console.log("Mark as read:", id);
  };

  const handleDelete = (id: string) => {
    // Implement delete functionality
    console.log("Delete notification:", id);
  };

  const handleMarkAllAsRead = () => {
    // Implement mark all as read functionality
    console.log("Mark all as read");
  };

  const handleClearAll = () => {
    // Implement clear all functionality
    console.log("Clear all notifications");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px] flex flex-col px-0">
        <SheetHeader className="px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <SheetTitle className="text-xl font-semibold">
                Notifications
              </SheetTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full px-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>
          <SheetDescription className="text-sm text-muted-foreground">
            Stay updated with your latest notifications
          </SheetDescription>
        </SheetHeader>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex gap-2 px-6 pb-4">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <ScrollArea className="flex-1 px-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                No notifications
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative rounded-lg border p-4 transition-colors",
                    !notification.read && "bg-accent/50",
                    getNotificationColor(notification.type)
                  )}
                >
                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div
                      className={cn(
                        "absolute top-4 left-2 h-2 w-2 rounded-full",
                        getTypeColor(notification.type)
                      )}
                    />
                  )}

                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-auto py-1 px-2 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="px-6 pt-4 border-t">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsSheet;
