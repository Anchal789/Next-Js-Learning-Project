"use server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export type RegisterState = {
	errors?: {
		email?: string;
		password?: string;
		firstName?: string;
		lastName?: string;
		error?: string;
	};
	values?: {
		email?: string;
		firstName?: string;
		lastName?: string;
		password?: string;
	};
	success?: boolean;
};

export type LoginState = {
	errors?: {
		email?: string;
		password?: string;
		error?: string;
	};
	values?: {
		email?: string;
		password?: string;
	};
	success?: boolean;
};

export async function registerFormSubmit(
	prevState: RegisterState,
	formData: FormData,
): Promise<RegisterState> {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const firstName = formData.get("firstName") as string;
	const lastName = formData.get("lastName") as string;

	const values = { email, firstName, lastName };
	const errors: RegisterState["errors"] = {};

	if (!email || !EMAIL_REGEX.test(email)) {
		errors.email = "Please enter a valid email";
	}

	if (!password) {
		errors.password = "Please enter a password";
	} else if (password.length < 8) {
		errors.password = "Password must be at least 8 characters";
	}

	if (!firstName) errors.firstName = "Please enter your first name";
	if (!lastName) errors.lastName = "Please enter your last name";

	if (Object.keys(errors).length > 0) {
		return { errors, values };
	}

	const existingEmail = await prisma.user.findUnique({ where: { email } });

	if (existingEmail) {
		return {
			errors: { error: "Email already exists" },
			values,
		};
	}

	const hashPassword = bcrypt.hashSync(password, 10);
	const passwordHash = hashPassword.toString();

	await prisma.user.create({
		data: {
			email: email,
			password: passwordHash,
			firstName: firstName,
			lastName: lastName,
		},
	});

	return { success: true, values: { email : "", firstName: "", lastName: "", password: "" } };
}


export default async function loginFormSubmit(prevState: LoginState, formData: FormData): Promise<LoginState> {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	const values = { email, password };
	const errors: LoginState["errors"] = {};

	if (!email || !EMAIL_REGEX.test(email)) {
		errors.email = "Please enter a valid email";
	}

	if (!password) {
		errors.password = "Please enter a password";
	}

	if (Object.keys(errors).length > 0) {
		return { errors, values };
	}

	const user = await prisma.user.findUnique({ where: { email } });

	if (!user) {
		return {
			errors: { error: "Email not found" },
			values,
		};
	}

	const isPasswordValid = bcrypt.compareSync(password, user.password);

	if (!isPasswordValid) {
		return {
			errors: { error: "Incorrect password" },
			values,
		};
	}

	return { success: true };
}