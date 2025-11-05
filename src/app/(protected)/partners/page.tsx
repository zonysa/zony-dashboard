"use client";

import { columns } from "@/components/tables/columns/partners-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetPartners } from "@/lib/hooks/usePartner";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { PartnerDetails } from "@/lib/schema/partner.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: partners } = useGetPartners();
  const { t } = useTranslation();

  const filterConfigs = [
    { key: "type", label: t("table.type"), placeholder: t("table.allTypes") },
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
    },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<PartnerDetails>) => {
    const partnerId = row.getValue("id");
    router.replace(`/partners/${partnerId}`);
  };

  return (
    <div className="px-6 py-10">
      <DataTable
        columns={columns()}
        data={partners ? partners.partners : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("table.search", "table.partners")}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
