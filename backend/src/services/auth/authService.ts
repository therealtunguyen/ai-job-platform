import { supabase } from "../../supabaseClient";
import { Database } from "../../types/supabase";

type User = Database["public"]["Tables"]["user_profiles"]["Row"];
type NewUser = Database["public"]["Tables"]["user_profiles"]["Insert"];

export interface AuthResponse {
    user: User | null;
    session: any;
    error: any;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData extends LoginCredentials {
    userType: "JOB_SEEKER" | "EMPLOYER";
    fullName?: string;
}

/**
 * Register a new user
 */
export const registerUser = async (
    userData: SignupData,
): Promise<AuthResponse> => {
    try {
        // First, sign up the user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
        });

        if (error) {
            console.error("Supabase Auth Error:", error.message);
            return { user: null, session: null, error: error };
        }

        if (data.user) {
            // Create user profile in the database
            const newUserProfile: NewUser = {
                user_id: data.user.id,
                user_type: userData.userType,
                is_active: true,
                last_login: new Date().toISOString(),
                created_at: new Date().toISOString(),
            };

            const { error: profileError } = await supabase
                .from("user_profiles")
                .insert([newUserProfile]);

            if (profileError) {
                // If profile creation fails, delete the auth user
                await supabase.auth.admin.deleteUser(data.user.id);
                return {
                    user: null,
                    session: null,
                    error: {
                        message:
                            "Profile creation failed: " + profileError.message,
                    },
                };
            }

            // Create additional profile based on user type
            if (userData.userType === "JOB_SEEKER") {
                const { error: seekerError } = await supabase
                    .from("job_seekers")
                    .insert([
                        {
                            user_id: data.user.id,
                            full_name: userData.fullName || "",
                            status: "INCOMPLETE",
                        },
                    ]);

                if (seekerError) {
                    console.error(
                        "Error creating job seeker profile:",
                        seekerError,
                    );
                }
            } else if (userData.userType === "EMPLOYER") {
                const { error: employerError } = await supabase
                    .from("employers")
                    .insert([
                        {
                            user_id: data.user.id,
                            company_name: userData.fullName || "",
                        },
                    ]);

                if (employerError) {
                    console.error(
                        "Error creating employer profile:",
                        employerError,
                    );
                }
            }

            return {
                user: {
                    user_id: data.user.id,
                    user_type: userData.userType,
                    is_active: true,
                    last_login: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                },
                session: data.session,
                error: null,
            };
        } else {
            // Handle case where user already exists
            return {
                user: null,
                session: null,
                error: { message: "User already exists" },
            };
        }
    } catch (error: any) {
        console.error("Registration error:", error);
        return { user: null, session: null, error };
    }
};

/**
 * Login a user
 */
export const loginUser = async (
    credentials: LoginCredentials,
): Promise<AuthResponse> => {
    try {
        const { email, password } = credentials;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Login error:", error.message);
            return { user: null, session: null, error };
        }

        if (data.user && data.session) {
            // Update last login time
            await supabase
                .from("user_profiles")
                .update({ last_login: new Date().toISOString() })
                .eq("user_id", data.user.id);

            // Get user profile
            const { data: userProfile, error: profileError } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", data.user.id)
                .single();

            if (profileError) {
                console.error("Error fetching user profile:", profileError);
                return { user: null, session: null, error: profileError };
            }

            return {
                user: userProfile,
                session: data.session,
                error: null,
            };
        } else {
            return {
                user: null,
                session: null,
                error: { message: "Invalid login response" },
            };
        }
    } catch (error: any) {
        console.error("Login error:", error);
        return { user: null, session: null, error };
    }
};

/**
 * Logout a user
 */
export const logoutUser = async (): Promise<{ error: any }> => {
    try {
        const { error } = await supabase.auth.signOut();
        return { error };
    } catch (error: any) {
        console.error("Logout error:", error);
        return { error };
    }
};

/**
 * Get current user session
 */
export const getCurrentUser = async () => {
    try {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();

        if (error) {
            console.error("Error getting session:", error.message);
            return { user: null, session: null, error };
        }

        if (!session) {
            return { user: null, session: null, error: null };
        }

        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

        if (profileError) {
            return { user: null, session: null, error: profileError };
        }

        return { user: userProfile, session, error: null };
    } catch (error: any) {
        console.error("Get current user error:", error);
        return { user: null, session: null, error };
    }
};

/**
 * Verify a JWT token
 */
export const verifyToken = async (token: string) => {
    try {
        const { data, error } = await supabase.auth.getUser(token);

        if (error) {
            console.error("Token verification error:", error.message);
            return { user: null, error };
        }

        return { user: data.user, error: null };
    } catch (error: any) {
        console.error("Token verification error:", error);
        return { user: null, error };
    }
};

