"use client";

import React, { useState } from 'react';
import UserManagement from './UserManagement';
import ValeManagement from './ValeManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="mb-6 sm:mb-8">
      <Tabs defaultValue="users" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3 mb-4">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" /> Gerenciar Usuários
          </TabsTrigger>
          <TabsTrigger value="vales" className="gap-2">
            <FileText className="h-4 w-4" /> Gerenciar Vales
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        <TabsContent value="vales">
          <ValeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
