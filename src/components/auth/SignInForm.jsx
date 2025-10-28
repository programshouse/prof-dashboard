import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuthStore } from "../../stors/useAuthStore";
import axios from "axios";

import { Formik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format.")
    .required("Email is required."),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters.")
    .required("Password is required."),
});

export default function SignInForm() {
  const navigate = useNavigate();
  const { login, loading, error, access_token } = useAuthStore();  
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (access_token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      navigate("/");  
    }
  }, [access_token, navigate]);

  const initialValues = { email: "", password: "" };
  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-md pt-10" />
      <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center">
        <div className="w-full">
          <div className="mb-6  sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2  font-semibold text-gray-800 dark:text-white/90">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            validateOnBlur
            validateOnChange={false}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              setStatus(undefined);
              try {
                await login(values.email.trim(), values.password);
                // التنقّل سيتم عبر useEffect عند وجود التوكن
              } catch (e) {
                // أي رسالة خطأ عامة من الستور ستظهر أسفل، ونضيف هنا احتياطياً
                const msg =
                  e instanceof Error ? e.message : "Sign in failed. Try again.";
                setStatus(msg);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              status,
            }) => (
              <form onSubmit={handleSubmit} noValidate>
                {/* تنبيه للأخطاء العامة (Yup/Server) */}
                {(status || error) && (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                    {status || error}
                  </div>
                )}

                <div className="space-y-5">
                  {/* Email */}
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="info@gmail.com"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="email"
                      aria-invalid={Boolean(touched.email && errors.email)}
                      aria-describedby="email-error"
                      className={`${
                        touched.email && errors.email
                          ? "ring-1 ring-red-400 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {touched.email && errors.email && (
                      <p
                        id="email-error"
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <Label>
                      Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="current-password"
                        aria-invalid={Boolean(
                          touched.password && errors.password
                        )}
                        aria-describedby="password-error"
                        className={`pr-10 ${
                          touched.password && errors.password
                            ? "ring-1 ring-red-400 focus:ring-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:hover:bg-white/10"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p
                        id="password-error"
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <div>
                    <Button
                      className="w-full"
                      size="md"
                      type="submit"
                      disabled={loading || isSubmitting}
                    >
                      {loading || isSubmitting ? "Signing in..." : "Sign in"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Formik>

          {/* <div className="mt-6">
            <p className="text-center text-sm font-normal text-gray-700 dark:text-gray-400 sm:text-start">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
              >
                Sign Up
              </Link>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}

