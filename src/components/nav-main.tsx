"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useTranslation } from "@/lib/hooks/useTranslation";

import { ChevronRight, type LucideIcon } from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavSubItem[];
}

/**
 * Which nav url the current pathname belongs to.
 *
 * Longest match wins, so a nested route lights up the section it lives in
 * (`/parcels/create` keeps "Parcels" active) without a shorter sibling stealing
 * it — `/warehouse/courier` has its own top-level entry and must not light up
 * the `/warehouse` group. "/" is exact-only, or it would match everything.
 */
function findActiveUrl(items: NavItem[], pathname: string): string | undefined {
  return items
    .flatMap((item) => [item.url, ...(item.items?.map((sub) => sub.url) ?? [])])
    .filter((url) =>
      url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(`${url}/`),
    )
    .sort((a, b) => b.length - a.length)[0];
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { isRTL } = useTranslation();

  const activeUrl = useMemo(() => findActiveUrl(items, pathname), [items, pathname]);
  const tooltipSide = isRTL ? "left" : "right";

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="gap-4">
          {items.map((item) =>
            item.items?.length ? (
              <NavGroupItem
                key={item.title}
                item={item}
                activeUrl={activeUrl}
                tooltipSide={tooltipSide}
              />
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.url === activeUrl}
                  tooltip={{ children: item.title, side: tooltipSide }}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavGroupItem({
  item,
  activeUrl,
  tooltipSide,
}: {
  item: NavItem;
  activeUrl?: string;
  tooltipSide: "left" | "right";
}) {
  const containsActive =
    item.url === activeUrl || !!item.items?.some((sub) => sub.url === activeUrl);

  const [open, setOpen] = useState(containsActive);

  // Navigating into the section from elsewhere shouldn't leave the group you're
  // standing in collapsed — `defaultOpen` alone only covers the mount case.
  // Collapsing it by hand while inside still sticks until you leave and return.
  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);

  return (
    <Collapsible asChild open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        {/* The label navigates to the section root; only the chevron toggles.
            Making the whole row a toggle would leave the hub page unreachable
            from the sidebar. */}
        <SidebarMenuButton
          asChild
          isActive={item.url === activeUrl}
          tooltip={{ children: item.title, side: tooltipSide }}
          className="pe-8"
        >
          <Link href={item.url}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>

        <CollapsibleTrigger asChild>
          <SidebarMenuAction className="rtl:left-1 rtl:right-auto">
            <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90 rtl:-scale-x-100" />
            <span className="sr-only">{item.title}</span>
          </SidebarMenuAction>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub className="rtl:border-l-0 rtl:border-r">
            {item.items?.map((sub) => (
              <SidebarMenuSubItem key={sub.url}>
                <SidebarMenuSubButton asChild isActive={sub.url === activeUrl}>
                  <Link href={sub.url}>
                    <span>{sub.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
