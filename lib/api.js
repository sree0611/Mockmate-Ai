// "use server";

// import { db } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { revalidatePath } from "next/cache";

// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// export async function saveResume(content) {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//   });

//   if (!user) throw new Error("User not found");

//   try {
//     const resume = await db.resume.upsert({
//       where: {
//         userId: user.id,
//       },
//       update: {
//         content,
//       },
//       create: {
//         userId: user.id,
//         content,
//       },
//     });

//     revalidatePath("/resume");
//     return resume;
//   } catch (error) {
//     console.error("Error saving resume:", error);
//     throw new Error("Failed to save resume");
//   }
// }

// export async function getResume() {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//   });

//   if (!user) throw new Error("User not found");

//   return await db.resume.findUnique({
//     where: {
//       userId: user.id,
//     },
//   });
// }

// export async function improveWithAI({ current, type }) {
//   const { userId } = await auth();
//   if (!userId) throw new Error("Unauthorized");

//   const user = await db.user.findUnique({
//     where: { clerkUserId: userId },
//     include: {
//       industryInsight: true,
//     },
//   });

//   if (!user) throw new Error("User not found");

//   const prompt = `
//     As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
//     Make it more impactful, quantifiable, and aligned with industry standards.
//     Current content: "${current}"

//     Requirements:
//     1. Use action verbs
//     2. Include metrics and results where possible
//     3. Highlight relevant technical skills
//     4. Keep it concise but detailed
//     5. Focus on achievements over responsibilities
//     6. Use industry-specific keywords

//     Format the response as a single paragraph without any additional text or explanations.
//   `;

//   try {
//     const result = await model.generateContent(prompt);
//     const response = result.response;
//     const improvedContent = response.text().trim();
//     return improvedContent;
//   } catch (error) {
//     console.error("Error improving content:", error);
//     throw new Error("Failed to improve content");
//   }
// }

import { db } from "@/utils/db";
// import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { Resume } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useAuth, useUser } from "@clerk/nextjs";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function saveResume(content) {
  // const { userId, user } = await auth();
  // if (!userId || !user) throw new Error("Unauthorized");

  //   const user = await currentUser();

  const { isSignedIn, user } = useUser();

  const userEmail = user?.primaryEmailAddress; // Clerk provides this

  try {
    const existingResume = await db.query.Resume.findFirst({
      where: eq(Resume.userEmail, userEmail),
    });

    if (existingResume) {
      await db
        .update(Resume)
        .set({ content, updatedAt: new Date() })
        .where(eq(Resume.userEmail, userEmail));
    } else {
      await db.insert(Resume).values({
        id: uuidv4(), // Equivalent to Prisma cuid()
        userEmail,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/resume");
    return { success: true, message: "Resume saved successfully" };
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId, user } = useAuth();

  const userEmail = user?.primaryEmailAddress;

  return await db.query.Resume.findFirst({
    where: eq(Resume.userEmail, userEmail),
  });
}

export async function improveWithAI({ current, type }) {
  const { isSignedIn, user } = useUser();

  const userEmail = user?.primaryEmailAddress;

  // No user table, so we assume industry info isn't stored in DB
  const industry = "Software Engineering"; // You may want to fetch this from another source

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const improvedContent = response.text().trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}
