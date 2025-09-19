"use client";
import React, { useState } from "react";
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
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/authSlice";
import { APIInterface } from "@/core/APIInterface";
import cubi from "@/core/cubi";

const Signup = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState("");

  function validate() {
    const errors: Record<string, string> = {};
    if (!form.email.includes("@")) errors.email = "Invalid Email";
    if (!/^(?=.*\d)[a-zA-Z\d]{8,}$/.test(form.username))
      errors.username = "At least 8 characters and one digit";
    if (form.password.length < 8)
      errors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form);

    if (!form.email || !form.username || form.password !== form.confirmPassword)
      return;

    setServerErrors("");
    const errors = validate();
    setErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const email = form.email;
    try {
      const {
        token,
        username: returnedusername,
        userId,
      } = await cubi.api.signup(form.email, form.username, form.password);
      dispatch(
        setAuth({ token, user: { email, username: returnedusername, userId } })
      );
      router.push("/dashboard");
    } catch (err: any) {
      setServerErrors(err?.error || "signup failed");
    }
  };
  return (
    <AuthLayout>
      <div className="flex w-full max-w-6xl min-h-[550px] justify-center gap-8 sm:gap-8 md:gap-64">
        {/* Right: Form */}
        <div className="items-center my-auto">
          <form onSubmit={handleSubmit}>
            <Card className="max-w-md w-[400px]">
              <div className="flex justify-center">
                <Image
                  src="/Manila/Other/Welcome--Streamline-Manila.png"
                  alt="VR"
                  width={150}
                  height={150}
                />
              </div>
              <CardHeader>
                <CardTitle>Signup to get started</CardTitle>
                <CardDescription>Enter your email and username</CardDescription>
                <CardAction>
                  <Link href={"/login"}>
                    <Button variant="link">Login</Button>
                  </Link>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />
                    {errors.email && (
                      <div className="text-red-500 text-xs">{errors.email}</div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">username</Label>
                    <Input
                      id="text"
                      type="username"
                      placeholder="user123"
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                      required
                    />
                    {errors.username && (
                      <div className="text-red-500 text-xs">
                        {errors.username}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                    />
                    {errors.password && (
                      <div className="text-red-500 text-xs">
                        {errors.password}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                    </div>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      required
                    />
                    {errors.confirmPassword && (
                      <div className="text-red-500 text-xs">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>
                {serverErrors && (
                  <p className="text-red-500 text-sm">{serverErrors}</p>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                  Signup
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
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
      </div>
    </AuthLayout>
  );
};

export default Signup;
