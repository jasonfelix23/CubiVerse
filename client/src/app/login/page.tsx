"use client";
import React, { useEffect, useState } from "react";
import AuthLayout from "../_components/Auth/AuthLayout";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "@/store/authSlice";
import { RootState } from "@/store";
import cubi from "@/core/cubi";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (password.length == 0 || email.length == 0) return;
      const {
        token,
        username: returnedusername,
        userId,
      } = await cubi.api.login(email, password);
      dispatch(
        setAuth({ token, user: { email, username: returnedusername, userId } })
      );
      router.push("/dashboard");
    } catch (err) {
      console.error("Login Failed", err);
    }
  };

  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (user && token) {
      router.replace("/dashboard");
    }
  }, [user, token]);

  return (
    <AuthLayout>
      <div className="flex w-full max-w-6xl min-h-[550px] justify-center gap-8 sm:gap-8 md:gap-64">
        {/* Left: Hero */}
        <div className="relative p-8 flex items-center justify-center text-gray-600">
          <div className="text-center">
            <Image
              src="/cubiVerse.png"
              alt="cubiverse"
              width={300}
              height={150}
            />
            <p className="text-lg">Where Pixels connect.</p>
          </div>
        </div>
        {/* Right: Form */}
        <div className="items-center my-auto">
          <Card className="max-w-md w-[400px]">
            <div className="flex justify-center">
              <Image
                src="/Manila/Other/Virtual-Reality-1--Streamline-Manila.png"
                alt="VR"
                width={150}
                height={150}
              />
            </div>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
              <CardAction>
                <Link href={"/signup"}>
                  <Button variant="link">Sign Up</Button>
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent>
              <form>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your passsssword?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full" onClick={handleSubmit}>
                Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
