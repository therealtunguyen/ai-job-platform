import { supabase } from "../../supabaseClient";
import { Database } from "../../types/supabase";

type User = Database["public"]["Tables"]["user_profiles"]["Row"];
type NewUser = Database["public"]["Tables"]["user_profiles"]["Insert"];

export interface AuthResponse {
  user: User | null;
  session: any;
  error: any;
  name?: string | null;
}

/**
 * Helper function to get the name based on user type
 * @param userId - The ID of the user
 * @param userType - The type of user (JOB_SEEKER or EMPLOYER)
 * @returns The name (full_name for job seeker, company_name for employer) or null
 */
const getNameByUserType = async (userId: string, userType: string) => {
  let name: string | null = null;

  if (userType === "JOB_SEEKER") {
    const { data: seekerData, error: seekerError } = await supabase
      .from("job_seekers")
      .select("full_name")
      .eq("user_id", userId)
      .single();

    if (!seekerError && seekerData) {
      name = seekerData.full_name;
    }
  } else if (userType === "EMPLOYER") {
    const { data: employerData, error: employerError } = await supabase
      .from("employers")
      .select("company_name")
      .eq("user_id", userId)
      .single();

    if (!employerError && employerData) {
      name = employerData.company_name;
    }
  }

  return name;
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  userType: "JOB_SEEKER" | "EMPLOYER";
  fullName?: string;
  profilePicture?: string;
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
      return { user: null, session: null, error: error, name: null };
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
            message: "Profile creation failed: " + profileError.message,
          },
          name: null,
        };
      }

      // Create additional profile based on user type
      if (userData.userType === "JOB_SEEKER") {
        const seekerData = {
          user_id: data.user.id,
          full_name: userData.fullName || "",
          status: "INCOMPLETE",
        };

        // Profile picture is optional - add it if provided
        if (userData.profilePicture) {
          (seekerData as any).profile_picture = userData.profilePicture;
        }

        const { error: seekerError } = await supabase
          .from("job_seekers")
          .insert([seekerData]);

        if (seekerError) {
          console.error("Error creating job seeker profile:", seekerError);
        }
      } else if (userData.userType === "EMPLOYER") {
        // For employers, include the logo if provided
        const employerData = {
          user_id: data.user.id,
          company_name: userData.fullName || "",
        };

        // Logo is optional - add it if provided
        if (userData.profilePicture) {
          (employerData as any).logo = userData.profilePicture;
        }

        const { error: employerError } = await supabase
          .from("employers")
          .insert([employerData]);

        if (employerError) {
          console.error("Error creating employer profile:", employerError);
        }
      }

      // Determine the name based on user type
      const name =
        userData.userType === "JOB_SEEKER"
          ? userData.fullName || null
          : userData.fullName || null;

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
        name: name,
      };
    } else {
      // Handle case where user already exists
      return {
        user: null,
        session: null,
        error: { message: "User already exists" },
        name: null,
      };
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return { user: null, session: null, error, name: null };
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
        return {
          user: null,
          session: null,
          error: profileError,
          name: null,
        };
      }

      // Fetch the name based on user type
      const name = await getNameByUserType(
        userProfile.user_id,
        userProfile.user_type,
      );

      return {
        user: userProfile,
        session: data.session,
        error: null,
        name: name,
      };
    } else {
      return {
        user: null,
        session: null,
        error: { message: "Invalid login response" },
        name: null,
      };
    }
  } catch (error: any) {
    console.error("Login error:", error);
    return { user: null, session: null, error, name: null };
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
      return { user: null, session: null, error, name: null };
    }

    if (!session) {
      return { user: null, session: null, error: null, name: null };
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (profileError) {
      return {
        user: null,
        session: null,
        error: profileError,
        name: null,
      };
    }

    // Fetch the name based on user type
    const name = await getNameByUserType(
      userProfile!.user_id,
      userProfile!.user_type,
    );

    return { user: userProfile, session, error: null, name: name };
  } catch (error: any) {
    console.error("Get current user error:", error);
    return { user: null, session: null, error, name: null };
  }
};

/**
 * Refresh a JWT token
 */
export const refreshToken = async (refreshToken: string) => {
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("Token refresh error:", error.message);
      return { session: null, error };
    }

    if (data.session) {
      return { session: data.session, error: null };
    }

    return { session: null, error: { message: "No session returned" } };
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return { session: null, error };
  }
};

/**
 * Update user email
 */
export const updateUserEmail = async (userId: string, newEmail: string) => {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      email: newEmail,
    });

    if (error) {
      console.error("Email update error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Email update error:", error);
    return { success: false, error: error.message || "Internal server error" };
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
      return { user: null, error, name: null };
    }

    if (data.user) {
      // Get user profile to determine user type
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("user_id", data.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return { user: null, error: profileError, name: null };
      }

      // Fetch the name based on user type
      const name = await getNameByUserType(
        data.user.id,
        userProfile!.user_type,
      );

      return { user: data.user, error: null, name: name };
    }

    return { user: data.user, error: null, name: null };
  } catch (error: any) {
    console.error("Token verification error:", error);
    return { user: null, error, name: null };
  }
};
