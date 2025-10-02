import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker"; // For generating realistic dummy data

dotenv.config();

// Load from .env or hardcode for testing (do not commit keys!)
const SUPABASE_URL =
    process.env.SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_SERVICE_KEY =
    process.env.SUPABASE_SERVICE_KEY || "your-service-role-key";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Use admin for user creation
const supabaseAdmin = supabase.auth.admin;

async function createDummyUsers() {
    const users = [
        // Job Seekers
        {
            email: "jobseeker1@example.com",
            password: "S_password1",
            data: { type: "JOB_SEEKER" },
        },
        {
            email: "jobseeker2@example.com",
            password: "S_password2",
            data: { type: "JOB_SEEKER" },
        },
        {
            email: "jobseeker3@example.com",
            password: "S_password3",
            data: { type: "JOB_SEEKER" },
        },
        {
            email: "jobseeker4@example.com",
            password: "S_password4",
            data: { type: "JOB_SEEKER" },
        },
        {
            email: "jobseeker5@example.com",
            password: "S_password5",
            data: { type: "JOB_SEEKER" },
        },

        // Employers
        {
            email: "theemployer1@example.com",
            password: "E_password1",
            data: { type: "EMPLOYER" },
        },
        {
            email: "theemployer2@example.com",
            password: "E_password2",
            data: { type: "EMPLOYER" },
        },
        {
            email: "theemployer3@example.com",
            password: "E_password3",
            data: { type: "EMPLOYER" },
        },
        {
            email: "theemployer4@example.com",
            password: "E_password4",
            data: { type: "EMPLOYER" },
        },
        {
            email: "theemployer5@example.com",
            password: "E_password5",
            data: { type: "EMPLOYER" },
        },
    ];

    const createdUsers = [];
    for (const user of users) {
        const { data, error } = await supabaseAdmin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true, // Auto-confirm for dummy data
            user_metadata: user.data,
        });
        if (error) throw error;
        createdUsers.push(data.user);
    }
    return createdUsers;
}

async function insertUserProfiles(users: any[]) {
    const profiles = users.map((user) => ({
        user_id: user.id,
        user_type: user.user_metadata.type,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: null,
    }));

    const { data, error } = await supabase
        .from("user_profiles")
        .insert(profiles)
        .select();
    if (error) throw error;
    return data;
}

async function insertSkills() {
    const skills = [
        {
            name: "Python",
            description: "Programming language",
            category: "Programming",
            created_at: new Date().toISOString(),
        },
        {
            name: "JavaScript",
            description: "Web development",
            category: "Programming",
            created_at: new Date().toISOString(),
        },
        {
            name: "SQL",
            description: "Database querying",
            category: "Database",
            created_at: new Date().toISOString(),
        },
        {
            name: "Project Management",
            description: "Team leadership",
            category: "Soft Skills",
            created_at: new Date().toISOString(),
        },
        {
            name: "Machine Learning",
            description: "AI models",
            category: "AI",
            created_at: new Date().toISOString(),
        },
    ];

    const { data, error } = await supabase
        .from("skills")
        .insert(skills)
        .select();
    if (error) throw error;
    return data;
}

async function insertJobSeekers(users: any[]) {
    const jobSeekers = users.filter(
        (u) => u.user_metadata.type === "JOB_SEEKER",
    );
    const profiles = jobSeekers.map((user) => ({
        user_id: user.id,
        full_name: faker.person.fullName(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        preferred_location: faker.location.city(),
        expected_salary: faker.number.int({ min: 50000, max: 150000 }),
        cv_file_path: "/dummy/cv/path.pdf",
        status: "COMPLETE", // Valid enum value
        summary: faker.lorem.paragraph(),
        profile_picture: "/dummy/profile/pic.jpg",
        last_updated: new Date().toISOString(),
    }));

    const { data, error } = await supabase
        .from("job_seekers")
        .insert(profiles)
        .select();
    if (error) throw error;
    return data;
}

async function insertEmployers(users: any[]) {
    const employers = users.filter((u) => u.user_metadata.type === "EMPLOYER");
    const profiles = employers.map((user) => ({
        user_id: user.id,
        company_name: faker.company.name(),
        contact_person: faker.person.fullName(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        description: faker.company.catchPhrase(),
        industry: faker.commerce.department(),
        logo: "dummy_logo.png",
    }));

    const { data, error } = await supabase
        .from("employers")
        .insert(profiles)
        .select();
    if (error) throw error;
    return data;
}

async function insertCvs(jobSeekers: any[]) {
    const cvs = jobSeekers.flatMap((seeker) => [
        {
            file_name: "cv1.pdf",
            file_path: "/storage/cv1.pdf",
            file_type: "application/pdf",
            file_size: 1024 * 1024,
            extracted_text: faker.lorem.paragraphs(3),
            status: "PARSED", // Assuming cv_status_enum, but schema uses TEXT; adjust if needed
            uploaded_at: new Date().toISOString(),
            job_seeker_id: seeker.user_id,
        },
    ]);

    const { data, error } = await supabase.from("cvs").insert(cvs).select();
    if (error) throw error;
    return data;
}

async function insertJobs(employers: any[]) {
    const jobs = employers.flatMap((employer) => [
        {
            title: faker.person.jobTitle(),
            description: faker.lorem.paragraphs(2),
            min_experience: faker.number.int({ min: 1, max: 5 }),
            max_experience: faker.number.int({ min: 6, max: 10 }),
            min_salary: 60000,
            max_salary: 120000,
            location: faker.location.city(),
            job_type: "FULL_TIME",
            status: "ACTIVE", // Valid enum
            posted_at: new Date().toISOString(),
            expires_at: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 30 days from now
            applicant_count: 0,
            employer_id: employer.user_id,
        },
    ]);

    const { data, error } = await supabase.from("jobs").insert(jobs).select();
    if (error) throw error;
    console.log("Errors inserting jobs:", error);
    console.log("Inserted jobs:", data);
    return data;
}

async function insertJobMatches(jobSeekers: any[], jobs: any[]) {
    const matches = [];
    for (let i = 0; i < 3; i++) {
        // Create 3 matches
        matches.push({
            candidate_id: jobSeekers[i % jobSeekers.length].user_id,
            job_id: jobs[i % jobs.length].job_id,
            match_score: faker.number.float({
                min: 0.5,
                max: 1.0,
                fractionDigits: 2,
            }),
            created_at: new Date().toISOString(),
        });
    }

    const { data, error } = await supabase
        .from("job_matches")
        .insert(matches)
        .select();
    if (error) throw error;
    return data;
}

async function insertApplications(jobSeekers: any[], jobs: any[]) {
    const applications = [];
    for (let i = 0; i < 3; i++) {
        applications.push({
            candidate_id: jobSeekers[i % jobSeekers.length].user_id,
            job_id: jobs[i % jobs.length].job_id,
            status: "SUBMITTED", // Valid enum
            applied_at: new Date().toISOString(),
            status_updated_at: null,
        });
    }

    const { data, error } = await supabase
        .from("applications")
        .insert(applications)
        .select();
    if (error) throw error;
    return data;
}

async function insertMockInterviews(jobSeekers: any[]) {
    const sessions = jobSeekers.map((seeker) => ({
        candidate_id: seeker.user_id,
        status: "COMPLETED", // Valid enum
        started_at: new Date().toISOString(),
        completed_at: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour later
    }));

    const { data, error } = await supabase
        .from("mock_interviews")
        .insert(sessions)
        .select();
    if (error) throw error;
    return data;
}

async function insertConversationEntries(sessions: any[]) {
    const entries = sessions.flatMap((session) => [
        {
            session_id: session.session_id,
            question_text: faker.lorem.sentence(),
            response_text: faker.lorem.paragraph(),
            question_asked_at: new Date().toISOString(),
            response_submitted_at: new Date(
                Date.now() + 300 * 1000,
            ).toISOString(), // 5 minutes later
        },
    ]);

    const { data, error } = await supabase
        .from("conversation_entries")
        .insert(entries)
        .select();
    if (error) throw error;
    return data;
}

async function insertWorkExperiences(jobSeekers: any[]) {
    const experiences = jobSeekers.flatMap((seeker) => [
        {
            job_seeker_id: seeker.user_id,
            company_name: faker.company.name(),
            position: faker.person.jobTitle(),
            description: faker.lorem.paragraph(),
            start_date: faker.date
                .past({ years: 5 })
                .toISOString()
                .split("T")[0], // YYYY-MM-DD
            end_date: faker.date.past({ years: 1 }).toISOString().split("T")[0],
            is_current: false,
        },
    ]);

    const { data, error } = await supabase
        .from("work_experiences")
        .insert(experiences)
        .select();
    if (error) throw error;
    return data;
}

async function insertEducations(jobSeekers: any[]) {
    const educations = jobSeekers.flatMap((seeker) => [
        {
            job_seeker_id: seeker.user_id,
            institution: faker.company.name(), // e.g., university name
            degree: "Bachelor of Science",
            major: faker.person.jobArea(),
            start_date: faker.date
                .past({ years: 10 })
                .toISOString()
                .split("T")[0],
            end_date: faker.date.past({ years: 5 }).toISOString().split("T")[0],
            grade: "3.8 GPA",
            description: faker.lorem.sentence(),
        },
    ]);

    const { data, error } = await supabase
        .from("educations")
        .insert(educations)
        .select();
    if (error) throw error;
    return data;
}

async function insertCertifications(jobSeekers: any[]) {
    const certs = jobSeekers.flatMap((seeker) => [
        {
            job_seeker_id: seeker.user_id,
            name: "Certified Python Developer",
            issuer: "Python Institute",
            issued_date: faker.date
                .past({ years: 2 })
                .toISOString()
                .split("T")[0],
            expiry_date: faker.date
                .future({ years: 2 })
                .toISOString()
                .split("T")[0],
        },
    ]);

    const { data, error } = await supabase
        .from("certifications")
        .insert(certs)
        .select();
    if (error) throw error;
    return data;
}

async function insertJobSeekerSkills(jobSeekers: any[], skills: any[]) {
    const links = [];
    for (const seeker of jobSeekers) {
        for (let i = 0; i < 3; i++) {
            // Link 3 skills per seeker
            links.push({
                job_seeker_id: seeker.user_id,
                skill_id: skills[i % skills.length].skill_id,
                added_at: new Date().toISOString(),
            });
        }
    }

    const { data, error } = await supabase
        .from("job_seeker_skills")
        .insert(links);
    if (error) throw error;
    return data;
}

async function insertJobRequiredSkills(jobs: any[], skills: any[]) {
    const links = [];
    for (const job of jobs) {
        for (let i = 0; i < 2; i++) {
            // 2 skills per job
            links.push({
                job_id: job.job_id,
                skill_id: skills[i % skills.length].skill_id,
                is_mandatory: true,
            });
        }
    }

    const { data, error } = await supabase
        .from("job_required_skills")
        .insert(links);
    if (error) throw error;
    return data;
}

async function main() {
    try {
        const users = await createDummyUsers();
        await insertUserProfiles(users);
        const skills = await insertSkills();
        const jobSeekers = await insertJobSeekers(users);
        const employers = await insertEmployers(users);
        await insertCvs(jobSeekers);
        const jobs = await insertJobs(employers);
        await insertJobMatches(jobSeekers, jobs);
        await insertApplications(jobSeekers, jobs);
        const sessions = await insertMockInterviews(jobSeekers);
        await insertConversationEntries(sessions);
        await insertWorkExperiences(jobSeekers);
        await insertEducations(jobSeekers);
        await insertCertifications(jobSeekers);
        await insertJobSeekerSkills(jobSeekers, skills);
        await insertJobRequiredSkills(jobs, skills);
        console.log("Dummy data inserted successfully.");
    } catch (error) {
        console.error("Error inserting dummy data:", error);
    }
}

main();
