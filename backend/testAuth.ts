/**
 * Test script to verify Supabase Authentication is working
 * Run with: npx ts-node testAuth.ts
 */

import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "./src/services/auth/authService";

async function testAuth() {
  console.log("Testing Supabase Authentication...");

  // Test registration
  console.log("\n1. Testing Registration...");
  const registrationResult = await registerUser({
    email: "tu.nguyendevwork@hcmut.edu.vn",
    password: "12345678",
    userType: "JOB_SEEKER",
    fullName: "Test User",
    profilePicture: "https://picsum.photos/200", // Placeholder for profile picture
  });

  if (registrationResult.error) {
    console.error("Registration failed:", registrationResult.error.message);
  } else {
    console.log("Registration successful:", registrationResult.user);
  }

  // Test login
  console.log("\n2. Testing Login...");
  const loginResult = await loginUser({
    email: "tu.nguyendevwork@hcmut.edu.vn",
    password: "12345678",
  });

  if (loginResult.error) {
    console.error("Login failed:", loginResult.error.message);
  } else {
    console.log("Login successful:", {
      userId: loginResult.user?.user_id,
      userType: loginResult.user?.user_type,
      session: !!loginResult.session,
    });

    // Test getting current user (now we can do it since we have a session)
    console.log("\n3. Testing Get Current User...");
    const currentUser = await getCurrentUser();
    if (currentUser.error) {
      console.error("Get current user failed:", currentUser.error.message);
    } else {
      console.log("Current user retrieved:", currentUser.user);
    }

    // Test logout
    console.log("\n4. Testing Logout...");
    const logoutResult = await logoutUser();
    if (logoutResult.error) {
      console.error("Logout failed:", logoutResult.error.message);
    } else {
      console.log("Logout successful");
    }
  }
}

// Run the test
testAuth().catch(console.error);
