"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";

export default function SettingsClient() {
  const [notifications, setNotifications] = useState({
    email: true,
    bookings: true,
    messages: true,
    marketing: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    // In a real app, you would save this to the database
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>Gérez vos préférences de notification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Notifications par email</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir des notifications par email
            </p>
          </div>
          <button
            onClick={() => toggleNotification("email")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.email ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.email ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Réservations</Label>
            <p className="text-sm text-muted-foreground">
              Notifications de nouvelles réservations
            </p>
          </div>
          <button
            onClick={() => toggleNotification("bookings")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.bookings ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.bookings ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Messages</Label>
            <p className="text-sm text-muted-foreground">
              Notifications de nouveaux messages
            </p>
          </div>
          <button
            onClick={() => toggleNotification("messages")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.messages ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.messages ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Actualités et offres</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir des informations sur les nouvelles fonctionnalités
            </p>
          </div>
          <button
            onClick={() => toggleNotification("marketing")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications.marketing ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.marketing ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
