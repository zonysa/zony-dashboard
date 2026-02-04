"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetUser } from "@/lib/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const userId = params.id as string;

  const { data, isLoading, error } = useGetUser(userId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("users.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              {t("users.loadingError")}
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => router.back()}
            >
              {t("common.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = data.user;
  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || undefined} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{fullName}</h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        </div>
        <Badge variant={user.is_active ? "success" : "destructive"}>
          {user.is_active ? t("status.active") : t("status.inactive")}
        </Badge>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("users.sections.personalInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("users.labels.email")}
                </p>
                <p className="font-mono text-sm">{user.email}</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("users.labels.phoneNumber")}
                </p>
                <p className="font-mono text-sm">{user.phone_number}</p>
              </div>
            </div>

            {/* Gender */}
            {user.gender && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("users.labels.gender")}
                  </p>
                  <p className="text-sm capitalize">{user.gender}</p>
                </div>
              </div>
            )}

            {/* Birth Date */}
            {user.birth_date && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("users.labels.birthDate")}
                  </p>
                  <p className="text-sm">{formatDate(user.birth_date)}</p>
                </div>
              </div>
            )}

            {/* Identity */}
            {user.identity && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("users.labels.identity")}
                  </p>
                  <p className="font-mono text-sm">{user.identity}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      {(user.city || user.country || user.zone || user.district) && (
        <Card>
          <CardHeader>
            <CardTitle>{t("users.sections.locationInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country */}
              {user.country && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("users.labels.country")}
                    </p>
                    <p className="text-sm">{user.country}</p>
                  </div>
                </div>
              )}

              {/* City */}
              {user.city && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("users.labels.city")}
                    </p>
                    <p className="text-sm">{user.city}</p>
                  </div>
                </div>
              )}

              {/* District */}
              {user.district && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("users.labels.district")}
                    </p>
                    <p className="text-sm">{user.district}</p>
                  </div>
                </div>
              )}

              {/* Zone */}
              {user.zone && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("users.labels.zone")}
                    </p>
                    <p className="text-sm">{user.zone}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("users.sections.accountInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User ID */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("users.labels.userId")}
                </p>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
            </div>

            {/* Username */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("users.labels.username")}
                </p>
                <p className="text-sm">@{user.username}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("users.labels.status")}
                </p>
                <Badge variant={user.is_active ? "success" : "destructive"}>
                  {user.is_active ? t("status.active") : t("status.inactive")}
                </Badge>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("users.labels.lastLogin")}
                </p>
                <p className="text-sm">{formatDate(user.last_login)}</p>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("users.labels.createdAt")}
                </p>
                <p className="text-sm">{formatDate(user.created_at)}</p>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("users.labels.updatedAt")}
                </p>
                <p className="text-sm">{formatDate(user.updated_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
