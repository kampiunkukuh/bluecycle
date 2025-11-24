import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Recycle } from "lucide-react";

export default function BlueCycleLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
    // TODO: Implement real authentication
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto h-16 w-16 rounded-lg bg-primary flex items-center justify-center">
            <Recycle className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-semibold">BlueCycle</CardTitle>
          <CardDescription>Waste Management Platform - Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="demo">Demo Login</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="button-login">
                  Sign In
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="demo" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground text-center">
                Try BlueCycle with a demo account
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => {
                    console.log("Demo login as Admin");
                    setLocation("/dashboard");
                  }}
                  data-testid="button-demo-admin"
                >
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-medium">Admin Account</span>
                    <span className="text-xs text-muted-foreground">Full platform access & analytics</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => {
                    console.log("Demo login as User");
                    setLocation("/dashboard");
                  }}
                  data-testid="button-demo-user"
                >
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-medium">User Account</span>
                    <span className="text-xs text-muted-foreground">Request pickups & track waste</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => {
                    console.log("Demo login as Driver");
                    setLocation("/dashboard");
                  }}
                  data-testid="button-demo-driver"
                >
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-medium">Driver Account</span>
                    <span className="text-xs text-muted-foreground">Manage routes & pickups</span>
                  </div>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
