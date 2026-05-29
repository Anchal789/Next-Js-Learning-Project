"use client";

import loginFormSubmit, { LoginState } from "@/actions/auth-actions";
import Link from "next/link";
import { useActionState, useEffect, useId, useState } from "react";
import { useToastr } from "toastr-next/react";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type FieldName = "email" | "password";

const validate = {
	email: (v: string) =>
		!v
			? "Please enter an email"
			: !EMAIL_REGEX.test(v)
				? "Please enter a valid email"
				: "",
	password: (v: string) => (!v ? "Please enter a password" : ""),
};

type FormFieldProps = {
	name: FieldName;
	label: string;
	type?: string;
	placeholder?: string;
	hint?: string;
	defaultValue?: string;
	serverError?: string;
};

function FormField({
	name,
	label,
	type = "text",
	placeholder,
	hint,
	defaultValue = "",
	serverError,
}: FormFieldProps) {
	const id = useId();
	const [value, setValue] = useState(defaultValue);
	const [touched, setTouched] = useState(false);

	const clientError = touched ? validate[name](value) : "";
	const error = clientError || (!touched ? serverError : "");

	const borderClass = error
		? "border-red-400 focus:ring-red-500"
		: "border-slate-300 focus:ring-blue-500";

	return (
		<div>
			<label
				htmlFor={id}
				className='block text-sm font-medium text-slate-700 mb-1.5'
			>
				{label}
			</label>
			<input
				id={id}
				name={name}
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onBlur={() => setTouched(true)}
				aria-invalid={!!error}
				aria-describedby={
					error ? `${id}-error` : hint ? `${id}-hint` : undefined
				}
				className={`w-full px-4 py-2.5 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${borderClass}`}
			/>
			<div className='flex justify-between gap-2 mt-1.5 min-h-4'>
				{error ? (
					<p id={`${id}-error`} className='text-xs text-red-500'>
						{error}
					</p>
				) : (
					<span />
				)}
				{hint && (
					<p id={`${id}-hint`} className='text-xs text-slate-500'>
						{hint}
					</p>
				)}
			</div>
		</div>
	);
}

const LoginPage = () => {
	const [state, formAction, loading] = useActionState<LoginState, FormData>(
		loginFormSubmit,
		{},
	);

	const toast = useToastr();

	useEffect(() => {
		if (state.success) {
			toast.success("Logged in successfully");
		} else if (state.errors?.error) {
			toast.error(state.errors.error);
		}
    }, [state]);
    
	return (
		<div className='min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4 py-12'>
			<div className='w-full max-w-md'>
				<div className='bg-white rounded-2xl shadow-xl p-8'>
					<header className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-slate-900 mb-2'>Login</h1>
						<p className='text-slate-500 text-sm'>Sign in to your account</p>
					</header>

					<form action={formAction} className='space-y-5' noValidate>
						<FormField
							name='email'
							label='Email Address'
							type='email'
							placeholder='you@example.com'
							defaultValue={state.values?.email}
							serverError={state.errors?.email}
						/>

						<FormField
							name='password'
							label='Password'
							type='password'
							placeholder='••••••••'
							hint='Must be at least 8 characters'
							serverError={state.errors?.password}
						/>

						<div className='flex items-start gap-2'>
							<input
								type='checkbox'
								id='terms'
								name='terms'
								className='mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
							/>
							<label htmlFor='terms' className='text-sm text-slate-600'>
								I agree to the{" "}
								<a href='#' className='text-blue-600 hover:underline'>
									Terms of Service
								</a>{" "}
								and{" "}
								<a href='#' className='text-blue-600 hover:underline'>
									Privacy Policy
								</a>
							</label>
						</div>

						<button
							type='submit'
							disabled={loading}
							className='w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed'
						>
							{loading ? "Creating account..." : "Create Account"}
						</button>
					</form>

					<p className='text-center text-sm text-slate-600 mt-6'>
						Not registered yet?{" "}
						<Link
							href='/register'
							className='text-blue-600 font-medium hover:underline'
						>
							Create an account
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
