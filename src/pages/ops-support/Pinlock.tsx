import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function Pinlock() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full">
      <div className="w-full p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Pinlock
          </h1>
          <p className="text-muted-foreground mt-1">Manage PIN lock status and requests</p>
        </div>

        <Card className="border-2 shadow-elegant">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Pinlock Management
            </CardTitle>
            <CardDescription>View and manage PIN lock records</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Pinlock management functionality coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
