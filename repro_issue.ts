
import { createClient } from "@supabase/supabase-js";
// import fetch from "node-fetch"; // Native fetch is available in Node 18+

const API_URL = "http://localhost:5000";

async function test() {
  // 1. Create a project
  console.log("Creating project...");
  const projectRes = await fetch(`${API_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Test Project",
      description: "Test Description",
      userId: "test-user" // This might be ignored if auth is mocked or handled differently
    })
  });

  if (!projectRes.ok) {
    console.error("Failed to create project:", await projectRes.text());
    return;
  }

  const project = await projectRes.json();
  console.log("Project created:", project.id);

  // 2. Try to save module progress
  console.log("Saving module progress...");
  const progressRes = await fetch(`${API_URL}/api/module-progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: project.id,
      moduleNumber: 1,
      phaseNumber: 1,
      content: "Test Content"
    })
  });

  if (!progressRes.ok) {
    console.error("Failed to save progress:", await progressRes.text());
  } else {
    console.log("Progress saved:", await progressRes.json());
  }
}

test().catch(console.error);
